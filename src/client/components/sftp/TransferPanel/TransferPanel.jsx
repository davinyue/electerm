import { Component } from 'react'
import { ConfigProvider } from 'antd'
import { autoRun } from 'manate'
import TransferHistory from '../../sidebar/transfer-history-modal'
import { transferLocales } from './locales'
import './TransferPanel.styl'

export default class TransferPanel extends Component {
  state = {
    fileTransfers: [],
    transferHistory: []
  }

  componentDidMount () {
    this.reaction = autoRun(() => {
      const { tabId } = this.props
      const fileTransfers = JSON.parse(JSON.stringify(window.store.fileTransfers.filter(t => t.tabId === tabId)))
      const transferHistory = JSON.parse(JSON.stringify(window.store.transferHistory.filter(t => t.tabId === tabId)))
      this.setState({ fileTransfers, transferHistory })
    })
    this.reaction.start()
  }

  componentWillUnmount () {
    this.reaction.stop()
  }

  render () {
    const { fileTransfers, transferHistory } = this.state
    const { tabId, language } = this.props
    return (
      <div className='sftp-transfer-panel'>
        <ConfigProvider locale={transferLocales[language] || transferLocales.en_us}>
          <TransferHistory fileTransfers={fileTransfers} transferHistory={transferHistory} tabId={tabId} language={language} />
        </ConfigProvider>
      </div>
    )
  }
}
