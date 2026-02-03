import { ExportsService } from './exports.service';
import { ExportQueryDto } from './dto/export.dto';
export declare class ExportsController {
    private exportsService;
    constructor(exportsService: ExportsService);
    exportSales(query: ExportQueryDto, res: Response): Promise<void>;
    exportProducts(query: ExportQueryDto, res: Response): Promise<void>;
    exportCustomers(query: ExportQueryDto, res: Response): Promise<void>;
    exportInventory(query: ExportQueryDto, res: Response): Promise<void>;
}
