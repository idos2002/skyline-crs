/**
 * @openapi
 * components:
 *   schemas:
 *     Gender:
 *       type: string
 *       enum:
 *         - male
 *         - female
 *         - other
 *         - unspecified
 */
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNSPECIFIED = 'unspecified',
}

export default Gender;
