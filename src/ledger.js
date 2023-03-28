import ledgerSdk from '@minka/ledger-sdk'

const { LedgerSdk } = ledgerSdk

// Populate this object with bank keys you have created previously
const bankKeyPair = {
  schema: 'ed25519',
  public: 'FPnQ9Hsunijk9CUvq9KidjOLxCt/te8ZPPA6gOdNKhI=',
  secret: 'HYf+A7gKvAPBGOnZh89NvCW88rZfi69y5yU7Ujiq178=',
}

// Populate with Ledger public key data.
export const ledgerSigner = {
  schema: 'ed25519',
  public: 'FPnQ9Hsunijk9CUvq9KidjOLxCt/te8ZPPA6gOdNKhI=',
}

// Configure the Ledger SDK.
const ledger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  //server: 'http://localhost:3000',
  //QIK_COMMENT Se apunta al ledger proporcionado por CARNET
  server: 'https://cardnet.ldg-stg.one/api/v2',
  // This is a public key of the ledger to verify requests sent
  // by the ledger to us, or responses returned by the ledger.
  key: ledgerSigner.public,
})

// Default record access.
const recordAccess = [
  {
    action: 'any',
    signer: bankKeyPair.public,
  },
  {
    action: 'any',
    bearer: bankKeyPair.public,
  },
]

// This function is used to notify Ledger of Entry processing final statuses.
export async function notifyLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action]

  if (!notifyStates.includes(notifyAction.state)) {
    return
  }

  const custom = {
    handle: entry.handle,
    action: notifyAction.action,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error.reason,
    detail: notifyAction.error.detail,
    failId: notifyAction.error.failId,
  }
  const ledgerResponse = await ledger.intent
    .from(entry.data.intent)
    .hash()
    .sign([
      {
        keyPair: bankKeyPair,
        custom,
      },
    ])
    .send()
  console.log(`SENT signature to Ledger\n${JSON.stringify(custom, null, 2)}`)
}
