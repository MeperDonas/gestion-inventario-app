# Documentacion del proyecto

Esta carpeta centraliza documentacion tecnica, operativa y de soporte del sistema de gestion de inventario.

## Secciones principales

| Seccion | Proposito | Ruta |
| --- | --- | --- |
| Arquitectura | Diagramas UML y guias de arquitectura | [`arquitectura/`](./arquitectura/) |
| Planes | Planes de implementacion, modelado e historicos | [`planes/`](./planes/) |
| Runbooks | Procedimientos operativos (deploy, incidentes) | [`runbooks/`](./runbooks/) |
| Reportes | Revisiones y reportes de cambios | [`reportes/`](./reportes/) |
| Manuales | Guias de uso por area (frontend, etc.) | [`manuales/`](./manuales/) |
| Datos de prueba | Archivos de importacion y muestras | [`datos-prueba/`](./datos-prueba/) |
| Referencias | Material externo y tooling de apoyo | [`referencias/`](./referencias/) |

## Arbol rapido

```text
docs/
|- arquitectura/
|  |- guia-maestra-proyecto.md
|  `- uml/
|- planes/
|  |- implementacion/
|  |- modelado/
|  `- historicos/
|- runbooks/
|- reportes/
|- manuales/
|- datos-prueba/
`- referencias/
```

## Archivos clave

- Guia maestra de arquitectura: [`arquitectura/guia-maestra-proyecto.md`](./arquitectura/guia-maestra-proyecto.md)
- UML modular (indice): [`arquitectura/uml/modulares/README.md`](./arquitectura/uml/modulares/README.md)
- Guia de presentacion UML: [`arquitectura/uml/modulares/guia-maestra-presentacion.md`](./arquitectura/uml/modulares/guia-maestra-presentacion.md)
- Plan de mejoras: [`planes/implementacion/plan-implementacion-mejoras.md`](./planes/implementacion/plan-implementacion-mejoras.md)
- Runbook de despliegue: [`runbooks/runbook-despliegue-produccion.md`](./runbooks/runbook-despliegue-produccion.md)
- Revision de codigo consolidada: [`reportes/revisiones/code-review-consolidado.md`](./reportes/revisiones/code-review-consolidado.md)

## Convencion de nombres

- Usar `kebab-case`.
- Solo minusculas.
- Solo ASCII (sin acentos, e n con tilde, apostrofes ni simbolos especiales).
- Separar palabras con `-`.
- Evitar puntos extra en el nombre (solo `.md`, `.puml`, `.csv`, etc. al final).
- Excepcion: `README.md` puede mantenerse en mayusculas por convencion.
