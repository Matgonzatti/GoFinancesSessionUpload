import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: [
        {
          title: category,
        },
      ],
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryExists);
    }

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      throw new AppError('You dont have money enough to this outcome');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
