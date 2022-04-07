export default interface Passport {
  /**
   * The passport number.
   */
  number: string;

  /**
   * The expiration date of the passport.
   */
  expirationDate: Date;

  /**
   * The ISO 3166-1 alpha-2 country code of the country that issued this passport.
   */
  countryIssued: string;
}
