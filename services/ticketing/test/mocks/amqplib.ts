export const mockConfirmChannel = {
  checkExchange: jest.fn().mockResolvedValue({}),
  assertExchange: jest.fn().mockResolvedValue({}),
  assertQueue: jest.fn().mockResolvedValue({}),
  bindQueue: jest.fn().mockResolvedValue({}),
  prefetch: jest.fn().mockResolvedValue({}),
  consume: jest.fn().mockResolvedValue({}),
  publish: jest.fn().mockReturnValue(true),
  on: jest.fn(),
  ack: jest.fn(),
  reject: jest.fn(),
};

export const mockConnection = {
  createConfirmChannel: jest.fn().mockResolvedValue(mockConfirmChannel),
  on: jest.fn(),
};

export default {
  connect: jest.fn().mockResolvedValue(mockConnection),
};
