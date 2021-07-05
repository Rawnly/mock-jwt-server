type User = {
  id: number;
  username: string;
  password: string;
};

export const USERS: User[] = [
  {
    id: 1,
    username: 'john',
    password: '123456',
  }, {
    id: 2,
    username: 'doe',
    password: 'abcdef',
  },
];
