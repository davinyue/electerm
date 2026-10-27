export function combineTransferRecords (fileTransfers, transferHistory) {
  const activeIds = new Set(fileTransfers.map(transfer => transfer.id))
  const history = transferHistory.filter(transfer => !activeIds.has(transfer.id))
  return [
    ...fileTransfers.map(transfer => ({ ...transfer, active: true })),
    ...history.filter(transfer => transfer.error).map(transfer => ({ ...transfer, active: false })),
    ...history.filter(transfer => !transfer.error).map(transfer => ({ ...transfer, active: false }))
  ]
}

export function removeCompletedRecords (tabId, fileTransfers, transferHistory) {
  const activeIds = new Set(fileTransfers.map(transfer => transfer.id))
  return transferHistory.filter(transfer =>
    transfer.tabId !== tabId || transfer.error || activeIds.has(transfer.id)
  )
}
