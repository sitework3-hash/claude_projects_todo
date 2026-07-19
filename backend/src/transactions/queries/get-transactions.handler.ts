import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma, prisma } from '@todo-learn/database';
import { GetTransactionsQuery } from '../../contracts/get-transactions.query';
import { TransactionsSummaryDto } from '../../contracts/transactions-summary.dto';
import { toTransactionDto } from '../transaction.mapper';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  async execute(query: GetTransactionsQuery): Promise<TransactionsSummaryDto> {
    const { userId, month, year } = query;

    // Диапазон дат строим в UTC, чтобы совпадать с <input type="date"> (YYYY-MM-DD → UTC-полночь).
    let dateFilter: Prisma.TransactionWhereInput = {};
    if (year && month) {
      dateFilter = {
        date: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      };
    } else if (year) {
      dateFilter = {
        date: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      };
    }

    const where: Prisma.TransactionWhereInput = { userId, ...dateFilter };

    // Два aggregate по type (а не groupBy) — чтобы обе суммы всегда были, даже если группа пустая.
    const [rows, incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { date: 'desc' } }),
      prisma.transaction.aggregate({ where: { ...where, type: 'income' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...where, type: 'expense' }, _sum: { amount: true } }),
    ]);

    const income = incomeAgg._sum.amount ?? new Prisma.Decimal(0);
    const expense = expenseAgg._sum.amount ?? new Prisma.Decimal(0);

    return {
      transactions: rows.map(toTransactionDto),
      totals: {
        income: income.toFixed(2),
        expense: expense.toFixed(2),
        balance: income.minus(expense).toFixed(2),
      },
    };
  }
}
