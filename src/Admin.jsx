import { useState, useEffect, useMemo } from 'react'

const REPO = 'Sky-Blue-Ai/vibe-coding-repo'
const NAMES = ['modules', 'projects', 'prompts']
// 站长登录密码校验（SHA-256）。修改密码：用
//   node -e "console.log(require('crypto').createHash('sha256').update('新密码').digest('hex'))"
// 生成新哈希替换下面这行。注意：这是前端门槛，真正的写权限保护来自 GitHub Token。
const PASS_SHA256 = 'b62313d6f7460275ddc6ad17d817a2a6a24694135d4fe26f34b54f26e654f43a'

const gh = async (path, opts = {}, token) => {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  })
  if (!r.ok) throw new Error('GitHub API ' + r.status + ': ' + (await r.text()).slice(0, 200))
  return r.json()
}

const fetchRemote = async (name) => {
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/main/content/${name}.json?t=${Date.now()}`, { cache: 'no-store' })
  if (!r.ok) throw new Error(name + ': ' + r.status)
  return r.json()
}

const COLORS = ['#2b6ef7', '#e07a5f', '#7a5fe0', '#e0a35f', '#5fb87a', '#e05f8a']
const KIND_LABEL = { modules: '核心知识模块', projects: '项目实战', prompts: 'Prompt 模板' }
const KIND_ICON = { modules: '✳', projects: '🚀', prompts: '✎' }

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* ---------------- 登录门 ---------------- */
function Login({ onPass }) {
  const [pwd, setPwd] = useState('')
  const [msg, setMsg] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    if ((await sha256(pwd)) === PASS_SHA256) {
      sessionStorage.setItem('vl_unlock', '1')
      onPass()
    } else {
      setMsg('密码不正确')
      setPwd('')
    }
  }
  return (
    <div className="admin-wrap flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
      <form onSubmit={submit} className="admin-card w-full" style={{ maxWidth: 380 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="logo-badge">V</div>
          <div>
            <h1 className="!mb-0" style={{ fontSize: 20 }}>站长登录</h1>
            <div className="text-xs text-[var(--muted)]">VIBE LAB 内容管理台</div>
          </div>
        </div>
        <label>管理密码</label>
        <input type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="请输入管理密码" />
        {msg && <div className="amsg err mt-2">{msg}</div>}
        <button className="abtn lime w-full mt-4" type="submit">进入管理台</button>
        <p className="text-xs text-[var(--muted)] mt-3">仅站长可进入。修改密码请编辑 src/Admin.jsx 中的 PASS_SHA256。</p>
      </form>
    </div>
  )
}

/* ---------------- Dashboard ---------------- */
export default function Admin({ onExit }) {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('vl_unlock') === '1')
  const [token, setToken] = useState(localStorage.getItem('vl_token') || '')
  const [authMsg, setAuthMsg] = useState({ text: token ? '检查中...' : '未连接', ok: false })
  const [tab, setTab] = useState('modules')
  const [data, setData] = useState({ modules: [], projects: [], prompts: [] })
  const [dirty, setDirty] = useState({})
  const [pubMsg, setPubMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [rawFile, setRawFile] = useState('modules')
  const [rawJson, setRawJson] = useState('')
  const [f, setF] = useState({ icon: '', title: '', summary: '', points: '', output: '', desc: '', color: COLORS[0], chips: '', prep: '', prompt: '' })

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const connect = async (t = token) => {
    try {
      await gh('/repos/' + REPO, {}, t)
      setAuthMsg({ text: '✓ 已连接 ' + REPO, ok: true })
      return true
    } catch (e) {
      setAuthMsg({ text: '连接失败：' + e.message, ok: false })
      return false
    }
  }
  const saveToken = async () => {
    const t = token.trim()
    localStorage.setItem('vl_token', t)
    if (await connect(t)) await reload(t)
  }
  const forget = () => {
    localStorage.removeItem('vl_token')
    setToken('')
    setAuthMsg({ text: '已断开', ok: false })
  }
  const logout = () => { sessionStorage.removeItem('vl_unlock'); setUnlocked(false) }
  const reload = async (t = token) => {
    try {
      const next = {}
      for (const n of NAMES) next[n] = await fetchRemote(n)
      setData(next)
      setDirty({})
      setPubMsg('已从仓库加载最新内容')
    } catch (e) { setPubMsg('拉取失败：' + e.message) }
  }

  useEffect(() => {
    if (unlocked && token) connect(token).then((ok) => { if (ok) reload(token) })
    // eslint-disable-next-line
  }, [])

  const putFile = async (name, content, t) => {
    let sha
    try { const meta = await gh(`/repos/${REPO}/contents/content/${name}.json`, {}, t); sha = meta.sha } catch (e) {}
    await gh(`/repos/${REPO}/contents/content/${name}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        message: 'content: update ' + name + ' via admin',
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
        sha,
      }),
    }, t)
  }
  const publish = async () => {
    const names = NAMES.filter((n) => dirty[n])
    if (!names.length) { setPubMsg('没有需要发布的改动'); return }
    setBusy(true)
    try {
      for (const n of names) await putFile(n, data[n], token)
      setDirty({})
      setPubMsg('✓ 已发布 ' + names.join(', ') + '，Actions 部署中（1-2 分钟生效）')
    } catch (e) { setPubMsg('发布失败：' + e.message) }
    setBusy(false)
  }

  const upd = (kind, arr) => { setData({ ...data, [kind]: arr }); setDirty({ ...dirty, [kind]: true }) }
  const addItem = () => {
    let it
    if (tab === 'modules') it = { icon: f.icon.trim(), title: f.title.trim(), summary: f.summary.trim(), points: f.points.split('\n').map(s => s.trim()).filter(Boolean), output: f.output.trim() }
    else if (tab === 'projects') it = { title: f.title.trim(), color: f.color, desc: f.desc.trim(), chips: f.chips.split(/[,，]/).map(s => s.trim()).filter(Boolean), prep: f.prep.split('\n').map(s => s.trim()).filter(Boolean) }
    else it = { title: f.title.trim(), color: f.color, prompt: f.prompt.trim() }
    if (!it.title) { alert('请填标题'); return }
    upd(tab, [...data[tab], it])
    setF({ ...f, title: '', summary: '', points: '', output: '', desc: '', chips: '', prep: '', prompt: '' })
    setPubMsg('已加入「' + it.title + '」，记得点发布')
  }
  const editItem = (i) => {
    const it = data[tab][i]
    setF({ ...f, icon: it.icon || '', title: it.title, summary: it.summary || '', points: (it.points || []).join('\n'), output: it.output || '', desc: it.desc || '', color: it.color || COLORS[0], chips: (it.chips || []).join(', '), prep: (it.prep || []).join('\n'), prompt: it.prompt || '' })
    upd(tab, data[tab].filter((_, j) => j !== i))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const delItem = (i) => { if (confirm('确定删除「' + data[tab][i].title + '」？（点发布后才真正提交）')) upd(tab, data[tab].filter((_, j) => j !== i)) }
  const moveItem = (i, d) => {
    const a = [...data[tab]]; const j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]
    upd(tab, a)
  }

  if (!unlocked) return <Login onPass={() => setUnlocked(true)} />

  const connected = authMsg.ok
  const dirtyCount = NAMES.filter((n) => dirty[n]).length
  const stats = [
    { label: '知识模块', value: data.modules.length, icon: '✳' },
    { label: '项目实战', value: data.projects.length, icon: '🚀' },
    { label: 'Prompt 模板', value: data.prompts.length, icon: '✎' },
    { label: '待发布改动', value: dirtyCount, icon: dirtyCount ? '●' : '✓', warn: dirtyCount > 0 },
  ]

  return (
    <div className="admin-wrap">
      {/* dashboard 头部 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="logo-badge">V</div>
        <div>
          <h1 className="!mb-0" style={{ fontSize: 24 }}>内容管理台</h1>
          <div className="text-xs text-[var(--muted)]">VIBE LAB Dashboard · {connected ? '已连接仓库' : '未连接仓库'}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="abtn ghost flex0" onClick={logout}>锁上</button>
          <button className="abtn ghost flex0" onClick={onExit}>← 返回主页</button>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="grid g4 mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {stats.map((s) => (
          <div className="card !p-4 text-center" key={s.label}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <b style={{ fontSize: 22 }}>{s.value}</b>
            <div className="text-xs text-[var(--muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 仓库连接 */}
      <div className="admin-card">
        <b>仓库连接</b>
        <div className="arow">
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="GitHub Token（Contents: Read and write，仅存浏览器）" style={{ flex: 3 }} />
          <button className="abtn lime flex0" onClick={saveToken}>连接</button>
          <button className="abtn ghost flex0" onClick={forget}>断开</button>
          <span className={'amsg ' + (authMsg.ok ? 'ok' : 'err')}>{authMsg.text}</span>
        </div>
      </div>

      {/* tabs */}
      <div className="atabs">
        {NAMES.map((n) => (
          <div key={n} className={'atab' + (tab === n ? ' active' : '')} onClick={() => setTab(n)}>
            {KIND_ICON[n]} {KIND_LABEL[n]}{dirty[n] && ' ●'}
          </div>
        ))}
      </div>

      {/* 发布条 */}
      <div className="admin-card" style={{ borderLeft: '4px solid var(--lime)' }}>
        <div className="arow !mt-0">
          <button className="abtn lime flex0" disabled={busy || !connected} onClick={publish}>🚀 发布全部改动</button>
          <button className="abtn ghost flex0" disabled={!connected} onClick={() => reload()}>↻ 从仓库重新拉取</button>
          <span className={'amsg ' + (pubMsg.startsWith('✓') ? 'ok' : pubMsg.startsWith('已') ? '' : 'err')}>{pubMsg}</span>
        </div>
      </div>

      <div className="grid g2" style={{ gridTemplateColumns: '2fr 3fr', alignItems: 'start' }}>
        {/* 左：编辑表单 */}
        <div className="admin-card">
          <b>{KIND_ICON[tab]} 新建 / 编辑{ { modules: '模块', projects: '项目', prompts: 'Prompt 模板' }[tab] }</b>
          {tab === 'modules' && (<>
            <div className="arow">
              <div className="flex0" style={{ width: 70 }}><label>图标</label><input value={f.icon} onChange={set('icon')} placeholder="✳" /></div>
              <div><label>标题</label><input value={f.title} onChange={set('title')} /></div>
            </div>
            <label>简介</label><textarea value={f.summary} onChange={set('summary')} />
            <label>要点（每行一条）</label><textarea value={f.points} onChange={set('points')} />
            <label>产出</label><input value={f.output} onChange={set('output')} />
          </>)}
          {tab === 'projects' && (<>
            <div className="arow">
              <div><label>标题</label><input value={f.title} onChange={set('title')} /></div>
              <div className="flex0" style={{ width: 110 }}><label>强调色</label><input value={f.color} onChange={set('color')} /></div>
            </div>
            <label>描述</label><textarea value={f.desc} onChange={set('desc')} />
            <label>标签（逗号分隔）</label><input value={f.chips} onChange={set('chips')} placeholder="全栈, 3 天" />
            <label>要做的准备（每行一条，可空）</label><textarea value={f.prep} onChange={set('prep')} />
          </>)}
          {tab === 'prompts' && (<>
            <div className="arow">
              <div><label>标题</label><input value={f.title} onChange={set('title')} /></div>
              <div className="flex0" style={{ width: 110 }}><label>强调色</label><input value={f.color} onChange={set('color')} /></div>
            </div>
            <label>模板内容（【】为占位符）</label><textarea value={f.prompt} onChange={set('prompt')} style={{ minHeight: 130, fontFamily: 'ui-monospace,Menlo,monospace' }} />
          </>)}
          <div className="arow"><button className="abtn" onClick={addItem}>＋ 添加到列表</button></div>
        </div>

        {/* 右：内容列表 */}
        <div className="admin-card">
          <b>已有内容（{data[tab].length}）</b>
          <div className="mt-3">
            {data[tab].length === 0 && <span className="amsg">{connected ? '暂无内容' : '请先连接仓库'}</span>}
            {data[tab].map((it, i) => (
              <div className="aitem" key={i}>
                <b>{it.title}</b>
                <button className="abtn ghost flex0" onClick={() => editItem(i)}>编辑</button>
                <button className="abtn ghost flex0" onClick={() => moveItem(i, -1)}>↑</button>
                <button className="abtn ghost flex0" onClick={() => moveItem(i, 1)}>↓</button>
                <button className="abtn danger flex0" onClick={() => delItem(i)}>删除</button>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary>高级：直接编辑 JSON</summary>
            <label>文件名</label>
            <select value={rawFile} onChange={(e) => setRawFile(e.target.value)}>
              {NAMES.map((n) => <option key={n}>{n}</option>)}
            </select>
            <label>JSON 内容</label>
            <textarea style={{ minHeight: 200, fontFamily: 'ui-monospace,Menlo,monospace' }} value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
            <div className="arow">
              <button className="abtn ghost flex0" onClick={async () => { try { setRawJson(JSON.stringify(await fetchRemote(rawFile), null, 2)); setPubMsg('已载入 ' + rawFile) } catch (e) { setPubMsg('载入失败：' + e.message) } }}>载入</button>
              <button className="abtn ghost flex0" disabled={!connected || busy} onClick={async () => {
                try {
                  const c = JSON.parse(rawJson)
                  await putFile(rawFile, c, token)
                  setData({ ...data, [rawFile]: c })
                  setDirty({ ...dirty, [rawFile]: true })
                  setPubMsg('✓ 已保存 ' + rawFile + '，等待部署')
                } catch (e) { setPubMsg('保存失败：' + e.message) }
              }}>保存该文件</button>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
