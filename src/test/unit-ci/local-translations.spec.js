const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

test('文件传输记录翻译合并到所有系统语言包', async () => {
  process.env.NODE_ENV = 'development'
  const { loadLocales } = require('../../app/lib/locales')
  const { langs, langMap } = await loadLocales()
  const localTranslations = require('../../app/lib/local-translations')
  const localeList = require(path.resolve(__dirname, '../../../node_modules/@electerm/electerm-locales/dist/cjs/list.json'))
  assert.equal(langs.length, localeList.length)
  for (const { id, lang } of langs) {
    assert.ok(localTranslations[id]?.fileTransferRecords, `${id} 缺少翻译`)
    assert.ok(lang.fileTransferRecords, `${id} 未加载翻译`)
    assert.equal(langMap[id].lang.fileTransferRecords, lang.fileTransferRecords)
  }
  assert.equal(langMap.zh_cn.lang.fileTransferRecords, '文件传输记录')
  assert.equal(langMap.en_us.lang.fileTransferRecords, 'file transfer records')
})
