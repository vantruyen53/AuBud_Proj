import type {IWalletRepositoryFactory, ActionTarget, IExtendedRepository,IWalletRepository,
    ISavingRepository,IDebtRepository,IGroupFundRepository
 } from '../../domain/models/application/repository/IWalletRepository.js';
import type{ IBaseRepository } from '../../domain/models/application/repository/IWalletRepository.js';
import {WalletRepository} from '../../data/repositories/Wallet/WalletRepositoryImpl.js';
import {SavingRepository} from '../../data/repositories/Wallet/SavingRepositoryImpl.js';
import {DebtRepository} from '../../data/repositories/Wallet/DebtRepositoryImpl.js';
import {GroupFundRepository} from '../../data/repositories/Wallet/GroupFundRepositoryImpl.js';

import type { Pool } from "mysql2/promise";

export class WalletRepositoryFactory implements IWalletRepositoryFactory {
    private repos: {
        wallet:    IWalletRepository;
        saving:    ISavingRepository;
        debt:      IDebtRepository;
        groupFund: IGroupFundRepository; 
    };

    constructor(pool: Pool) {
        this.repos = {
            wallet:    new WalletRepository(pool),
            saving:    new SavingRepository(pool),
            debt:      new DebtRepository(pool),
            groupFund: new GroupFundRepository(pool),
        };
    }

    getRepo(target: ActionTarget): IBaseRepository<any, any, any> {
        if (target === 'groupFund') throw new Error('groupFund chỉ hỗ trợ read');
        return this.repos[target];
    }

    getGroupFundRepo(): IGroupFundRepository {
        return this.repos.groupFund;
    }

    getExtendedRepo(target: 'saving' | 'debt'): IExtendedRepository<any, any, any, any, any> {
        return this.repos[target] as IExtendedRepository<any, any, any, any, any>;
    }
}