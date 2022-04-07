export default interface Address {
  /**
   * ISO 3166-1 alpha-2 country code.
   */
  countryCode: string;

  /**
   * ISO 3166-2 subdivision code.
   */
  subdivisionCode?: string;

  /**
   * City name.
   */
  city: string;

  /**
   * Street name.
   */
  street: string;

  /**
   * House number.
   */
  houseNumber: string;

  /**
   * Postal code.
   */
  postalCode: string;
}
