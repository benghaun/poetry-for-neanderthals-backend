import { Team } from '../team/team';

export class Player {
  public hasBeenPoet = false;
  constructor(
    public readonly name: string,
    public readonly team: Team,
  ) {}
}
