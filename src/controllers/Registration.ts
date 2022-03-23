import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import express from 'express';

const handleRegistration = async (
  req: express.Request,
  res: express.Response,
  db: Knex<any, unknown[]>,
): Promise<void> => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json('Incorrect form submission');
  }

  const userWithThisEmail = await db('users')
    .where('email', email)
    .catch(() => {
      res.status(500).json('Error in get user with this email');
      return [];
    });

  const userExist = userWithThisEmail[0]; // TODO add type to user

  if (userExist) {
    res.status(400).json('User with current email already exist');
  }

  const salt: string = await bcrypt.genSalt(10);
  const hash: string = await bcrypt.hash(password, salt);

  await db('users').insert({
    email, name, password: hash, joined: new Date().toISOString(),
  }).catch(() => res.status(500).json('Error in insert data in db'));

  const user = await db('users')
    .where('email', email); // TODO remove and just send data , which i insert before

  res.send(user);

  /*
  * TODO create hash +
  * TODO Check if this user exist (send message User with this email already exist.) +
  *  If no - create in database +
  * TODO insert hash to database +
  * TODO change database (save hash of password in user) +
  * TODO add to redis
  * */
};

export default handleRegistration;
