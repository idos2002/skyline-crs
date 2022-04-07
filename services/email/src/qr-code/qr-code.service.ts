import qrcode from 'qrcode';

type QrCodeDataUri = string;

export interface FlightTicketQrCodeContent {
  bookingId: string;
}

export interface BoardingPassQrCodeContent {
  bookingId: string;
  bookedSeatId: string;
}

export default class QrCodeService {
  private readonly qrCodeOptionsDefaults: qrcode.QRCodeToDataURLOptions = {
    margin: 0,
  };

  private constructor() {}

  public static async create(): Promise<QrCodeService> {
    return new QrCodeService();
  }

  public async createFlightTicketQrCode(
    content: FlightTicketQrCodeContent,
    options?: qrcode.QRCodeToDataURLOptions,
  ): Promise<QrCodeDataUri> {
    const contentJson = JSON.stringify(content);
    return await qrcode.toDataURL(contentJson, {
      ...this.qrCodeOptionsDefaults,
      ...options,
    });
  }

  public async createBoardingPassQrCode(
    content: BoardingPassQrCodeContent,
    options?: qrcode.QRCodeToDataURLOptions,
  ): Promise<QrCodeDataUri> {
    const contentJson = JSON.stringify(content);
    return await qrcode.toDataURL(contentJson, {
      ...this.qrCodeOptionsDefaults,
      ...options,
    });
  }
}
