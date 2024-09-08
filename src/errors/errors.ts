export class ClientFacingError extends Error {}

export class NoCurrentRoundError extends ClientFacingError {
  constructor() {
    super('Cannot perform action as the round has ended');
  }
}
