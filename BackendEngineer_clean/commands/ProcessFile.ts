import { BaseCommand } from "@adonisjs/core/build/standalone";
import File from "App/Models/File";
import Client from "App/Models/Client";
import ClientBankDetails from "App/Models/Bank";
import ClientAddress from "App/Models/Address";

import * as XLSX from "xlsx";

interface ClientData {
  name: string;
  email?: string;
  phoneNumber?: string;
  pan?: string;
}

interface ClientBankDetailsData {
  clientId: number;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode?: string;
  address?: string;
  city?: string;
}

interface ClientAddressData {
  clientId: number;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  state?: string;
  zip?: string;
}

export default class ProcessFile extends BaseCommand {
  public static commandName = "process:file";

  public static description = "process excel file into database";

  public static settings = {
    loadApp: true,
  };

  public async run() {
    const { default: FileModel } = await import("App/Models/File");
    const files = await FileModel.query().orderBy("id").limit(1);
    this.processFiles(files);
    console.log("files", files);
  }

  public async processFiles(files: File[]) {
    for (const file of files) {
      const workbook = XLSX.readFile(file.filePath);
      const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
      const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
      const sheet3 = workbook.Sheets[workbook.SheetNames[2]];

      const clientData: ClientData[] = XLSX.utils.sheet_to_json(sheet1);

      for (const data of clientData) {
        await Client.create(data);
      }

      const bankData: ClientBankDetailsData[] =
        XLSX.utils.sheet_to_json(sheet2);

      for (const data of bankData) {
        await ClientBankDetails.create(data);
      }

      const addressData: ClientAddressData[] = XLSX.utils.sheet_to_json(sheet3);

      for (const data of addressData) {
        await ClientAddress.create(data);
      }
    }
  }
}
