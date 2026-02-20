param(
  [string]$BaseUrl = "http://localhost:3001/api",
  [string]$AdminEmail = $env:ADMIN_EMAIL,
  [string]$AdminPassword = $env:ADMIN_PASSWORD,
  [string]$CashierEmail = $env:CASHIER_EMAIL,
  [string]$CashierPassword = $env:CASHIER_PASSWORD
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-StatusCode {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers,
    [string]$Body
  )

  try {
    $params = @{
      Method      = $Method
      Uri         = $Url
      Headers     = $Headers
      ErrorAction = "Stop"
    }

    if ($Body) {
      $params["ContentType"] = "application/json"
      $params["Body"] = $Body
    }

    $response = Invoke-WebRequest @params
    return [int]$response.StatusCode
  }
  catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode.value__
    }

    Write-Host "Error calling ${Url}: $($_.Exception.Message)" -ForegroundColor Red
    return -1
  }
}

function Get-Token {
  param(
    [string]$Email,
    [string]$Password
  )

  $payload = @{
    email    = $Email
    password = $Password
  } | ConvertTo-Json

  try {
    $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" -Body $payload

    if ($response.access_token) { return $response.access_token }
    if ($response.token) { return $response.token }

    throw "Login response does not contain access_token/token."
  }
  catch {
    throw "Login failed for ${Email}: $($_.Exception.Message)"
  }
}

if ([string]::IsNullOrWhiteSpace($AdminEmail) -or [string]::IsNullOrWhiteSpace($AdminPassword) -or [string]::IsNullOrWhiteSpace($CashierEmail) -or [string]::IsNullOrWhiteSpace($CashierPassword)) {
  throw "Missing credentials. Set ADMIN_EMAIL, ADMIN_PASSWORD, CASHIER_EMAIL, CASHIER_PASSWORD env vars or pass params."
}

Write-Host "Getting tokens..." -ForegroundColor Cyan
$adminToken = Get-Token -Email $AdminEmail -Password $AdminPassword
$cashierToken = Get-Token -Email $CashierEmail -Password $CashierPassword

$tests = @(
  @{
    Name     = "GET /settings without token => 401"
    Method   = "GET"
    Path     = "/settings"
    Headers  = @{}
    Body     = $null
    Expected = 401
  },
  @{
    Name     = "GET /settings with CASHIER => 403"
    Method   = "GET"
    Path     = "/settings"
    Headers  = @{ Authorization = "Bearer $cashierToken" }
    Body     = $null
    Expected = 403
  },
  @{
    Name     = "POST /exports/customers with CASHIER => 403"
    Method   = "POST"
    Path     = "/exports/customers"
    Headers  = @{ Authorization = "Bearer $cashierToken" }
    Body     = "{}"
    Expected = 403
  },
  @{
    Name     = "POST /auth/register removed => 404"
    Method   = "POST"
    Path     = "/auth/register"
    Headers  = @{}
    Body     = '{"email":"phase1-check@test.local","password":"123456","name":"Phase1"}'
    Expected = 404
  }
)

$passed = 0

foreach ($test in $tests) {
  $status = Get-StatusCode -Method $test.Method -Url "$BaseUrl$($test.Path)" -Headers $test.Headers -Body $test.Body

  if ($status -eq $test.Expected) {
    Write-Host "PASS: $($test.Name)" -ForegroundColor Green
    $passed++
  }
  else {
    Write-Host "FAIL: $($test.Name) (expected $($test.Expected), got $status)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Result: $passed/$($tests.Count) checks passed." -ForegroundColor Yellow

if ($passed -ne $tests.Count) {
  exit 1
}

Write-Host "Phase 1 API manual checks completed." -ForegroundColor Cyan
