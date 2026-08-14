import type { ITransactionMetadata } from '@core/entities/interfaces/transaction.entity.interface';
import type { IWalletLedger, LedgerMetadataType } from '@core/entities/interfaces/wallet-ledger.entity.interface';
import type { WalletLedgerDocument } from '@core/schema/wallet-ledger.schema';

export interface IWalletLedgerMapper {
  toEntity(doc: WalletLedgerDocument): IWalletLedger;
  toDocument(entity: Partial<IWalletLedger>): Partial<WalletLedgerDocument>;
  mapTransactionMetadataToLedgerMetadata(metadata?: ITransactionMetadata | null): LedgerMetadataType | null;
}
