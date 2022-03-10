/**
 * @openapi
 * components:
 *   schemas:
 *     CabinClass:
 *       type: string
 *       enum:
 *         - E
 *         - B
 *         - F
 *       description: |-
 *         Cabin class of the aircraft cabin.
 *
 *         There are three available cabin classes:
 *           - E - Economy class
 *           - B - Business class
 *           - F - First class
 */
enum CabinClass {
  ECONOMY = 'E',
  BUSINESS = 'B',
  FIRST = 'F',
}

export default CabinClass;
