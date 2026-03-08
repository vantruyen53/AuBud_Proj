import type { WalletEntity, SavingEntity,SavingHistoryEntity, DebtEntity, DebtHistoryEntity,GroupFundEntity } from "../../../entities/appEntities.js"
import type { CreateWalletDTO, UpdateWalletDTO, CreateSavingDTO, UpdateSavingDTO,
CreateSavingTransactionDTO, CreateDebtDTO,UpdateDebtDTO,CreateDebtTransactionDTO
} from "../../../../data/DTO/AppDTO.js";;

//=============================WALLET BASE REPOSITORY INTERFACE
export type ActionTarget = 'wallet' | 'saving' | 'debt' | 'groupFund';

export interface IWalletRepositoryFactory {
    // Factory trả về đúng repo dựa trên actionType
    getRepo(target: ActionTarget): IBaseRepository<any, any, any>;
    getGroupFundRepo(): IGroupFundRepository;
    // Trả về repo có history — chỉ saving và debt mới có
    getExtendedRepo(target: 'saving' | 'debt'): IExtendedRepository<any, any, any, any, any>;
}

export interface IBaseRepository<TEntity, TCreateDTO, TUpdateDTO> {
    findAllByUserId(userId: string): Promise<TEntity[]>;
    findById(userId:string, id:string): Promise<TEntity | null>
    create(dto: TCreateDTO, userId:string, encryptedNewBalance?:string): Promise<boolean>;
    update(dto: TUpdateDTO): Promise<boolean>;
    delete(id: string, userId: string): Promise<boolean>;
}

export interface IHistoryRepository<THistoryEntity, TTransactionDTO> {
    findHistory(parentId: string): Promise<THistoryEntity[]>;
    createHistory(dto: TTransactionDTO): Promise<boolean>;
    deleteHistory(dto:any): Promise<boolean>;
}
// Repo có cả CRUD lẫn History thì kế thừa cả 2
export interface IExtendedRepository<TEntity, TCreateDTO, TUpdateDTO, THistoryEntity, TTransactionDTO>
    extends IBaseRepository<TEntity, TCreateDTO, TUpdateDTO>,IHistoryRepository<THistoryEntity, TTransactionDTO> {
    }

export interface IWalletRepository 
    extends IBaseRepository<WalletEntity, CreateWalletDTO, UpdateWalletDTO> {}

export interface ISavingRepository 
    extends IExtendedRepository<SavingEntity, CreateSavingDTO, UpdateSavingDTO, SavingHistoryEntity, CreateSavingTransactionDTO> {}

export interface IDebtRepository 
    extends IExtendedRepository<DebtEntity, CreateDebtDTO, UpdateDebtDTO, DebtHistoryEntity, CreateDebtTransactionDTO> {}

export interface IGroupFundRepository 
    extends Pick<IBaseRepository<GroupFundEntity, never, never>, 'findAllByUserId'> {}