import { useState, useEffect, useMemo } from 'react'
import Admin from './Admin.jsx'

const NAV = [
  { group: 'START HERE', items: [
    { s: 'map', p: 10, num: '01', label: '学习地图' },
    { s: 'route', p: 15, num: '02', label: '选择学习路线' },
    { s: 'flowmap', p: 10, num: '03', label: '完整学习地图' },
  ]},
  { group: 'LEARN BY DOING', items: [
    { s: 'knowledge', p: 10, num: '04', label: '核心知识模块' },
    { s: 'workflow', p: 20, num: '05', label: '标准开发工作流' },
    { s: 'projects', p: 15, num: '06', label: '项目实战' },
    { s: 'stack', p: 10, num: '07', label: '工具与技术栈' },
  ]},
  { group: 'REFERENCE', items: [
    { s: 'prompts', p: 10, num: '08', label: 'Prompt 模板库' },
    { s: 'troubleshoot', p: 5, num: '09', label: '常见问题排查' },
    { s: 'dict', p: 5, num: '10', label: '技术词典' },
    { s: 'checklist', p: 5, num: '11', label: '交付检查清单' },
  ]},
]

const ROUTES = [
  { icon: '🚀', title: '路线 A · 做出第一个产品（4 周）', desc: '01 学习地图 → 04 核心知识（只看 M1/M2）→ 05 工作流 → 06 项目实战（项目 1）→ 11 交付清单', chip: '每周 3-5 小时' },
  { icon: '📚', title: '路线 B · 系统掌握 Vibe Coding（8 周）', desc: '全部模块按顺序学习，每学完一个模块做一次小练习。', chip: '每周 5-8 小时' },
  { icon: '⚡', title: '路线 C · 开发者提效（2 周）', desc: '05 工作流 → 08 Prompt 模板库 → 09 问题排查 → 07 工具链', chip: '每周 2-3 小时' },
  { icon: '🤖', title: '路线 D · 做 AI 产品 / Agent（6 周）', desc: '04 核心知识（M3/M4）→ 06 项目实战（项目 4）→ 07 工具链', chip: '需要一定基础' },
]

const STAGES = [
  { color: '', title: '认识 Vibe Coding', desc: '什么是 Vibe Coding、适用场景、与传统开发的区别。' },
  { color: '#e07a5f', title: '发现问题与定义需求', desc: '从真实痛点出发，把模糊想法变成清晰需求。' },
  { color: '#7a5fe0', title: '熟悉 AI 编程工具', desc: 'Claude Code、Cursor、Codex 等工具的选择与上手。' },
  { color: '#e0a35f', title: '设计与生成前端', desc: '设计参考、页面结构、生成前端页面并逐步调整。' },
  { color: '', title: '接入 AI 能力', desc: '调用 AI API，让产品真正"智能"起来。' },
  { color: '#5fb87a', title: '补齐后端与数据', desc: '数据库、登录、存储，让数据能保存下来。' },
  { color: '#e05f8a', title: '测试、调试与安全', desc: '跑通流程、修 bug、检查权限与数据安全。' },
  { color: '#5fb8d6', title: '部署与迭代维护', desc: '上线、自定义域名、收集反馈、持续迭代。' },
]

const FLOW_STEPS = [
  { phase: 'PHASE 01 · 准备', dot: '#7a5fe0', steps: [['00', '建仓', 'Github 建仓库，每步 commit 可回退'], ['01', '写 PRD', '功能描述 · 数据结构 · 交互逻辑']] },
  { phase: 'PHASE 02 · 视觉', dot: '#4f8ff7', steps: [['02', 'UI 视觉确认', '找参考 → demo → 选风格 → 设计规范'], ['03', '做页面前端', '先做出所有页面，逐页调整']] },
  { phase: 'PHASE 03 · 开发', dot: '#e08a5f', steps: [['04', '拆分 Issues', '拆细切片 · 拆界面 · 标注依赖'], ['05', '正式开发', '按 Issue 逐个开发']] },
  { phase: 'PHASE 04 · 交付', dot: '#5fb87a', steps: [['06', '全功能验收测试', '业务流走查'], ['07', 'UI 细节打磨', '组件 · 对齐间距 · 一致性'], ['08', '上线', 'Vercel · 自定义域名 · 生产数据库'], ['09', '迭代维护', '新需求记录，重新走流程']] },
]

const TROUBLES = [
  ['界面没变化 / 改老', '改的是旧文件、没保存、或浏览器缓存 → 强刷（Ctrl+Shift+R），确认 AI 改的文件就是正在运行的文件。'],
  ['Module not found', '包没装或路径写错 → 看报错里的包名，npm install；检查 import 路径大小写。'],
  ['API 401 / 403', '密钥没配、配错环境、或没加到服务器端 → 检查 .env 与调用位置（密钥不能出现在前端）。'],
  ['改 A 坏 B（回归）', '改动面太大 → 回退到上一个 commit，把需求拆小，一次只改一件事。'],
]

const DICT = [
  ['MVP', '最小可行产品：能验证想法的最简版本。'], ['PRD', '产品需求文档：写清楚做什么、给谁用。'], ['API', '程序之间对话的接口，AI 能力靠它接入。'],
  ['HTML', '网页的骨架，决定页面上有什么。'], ['CSS', '网页的皮肤，决定长什么样。'], ['JavaScript', '网页的行为，让它动起来、能交互。'],
  ['组件 Component', '可复用的界面积木，如按钮、卡片。'], ['State', '页面当前的数据状态，变了界面就变。'], ['Repo', '代码仓库，项目的全部历史与版本。'],
]

const DEFAULT_CHECKS = [
  ['需求没跑偏', '核心功能与 PRD 一致，没有偷偷加/漏功能。'],
  ['核心流程走得通', '从打开 → 使用 → 拿到结果，全程无阻断。'],
  ['空状态/异常提示', '没数据、网络失败、输错时有友好提示。'],
  ['手机能用', '在手机浏览器打开核心页面检查布局。'],
  ['密钥不在前端', 'API key 只在服务端/环境变量，代码仓库里没有明文密钥。'],
  ['数据能保存', '刷新/重启后用户数据还在。'],
  ['回退方案', 'git 有干净提交，出问题能回退到上一个版本。'],
  ['上线地址可访问', '部署链接（Vercel 等）打开正常，HTTPS 生效。'],
  ['找真实用户试过', '至少 1 个目标用户完整用过一次，收集了反馈。'],
]

async function loadData(name) {
  try {
    const r = await fetch(`content/${name}.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) throw new Error(r.status)
    return await r.json()
  } catch (e) { console.warn('load', name, e); return [] }
}

export default function App() {
  const route = useMemo(() => location.hash.replace(/^#\/?/, ''), [])
  const [view, setView] = useState(route === 'admin' ? 'admin' : 'main')
  const [section, setSection] = useState(route && route !== 'admin' ? route : 'map')
  const [data, setData] = useState({ modules: [], projects: [], prompts: [] })
  const [done, setDone] = useState(() => JSON.parse(localStorage.getItem('vl_checks') || '[]'))

  useEffect(() => {
    Promise.all(['modules', 'projects', 'prompts'].map(loadData)).then(([m, p, t]) => setData({ modules: m, projects: p, prompts: t }))
  }, [])

  const go = (s) => {
    if (s === 'troubleshoot') s = 'prompts'
    if (s === 'dict') s = 'checklist'
    setView('main'); setSection(s)
    history.replaceState(null, '', '#' + s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const toggleCheck = (i) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i]
    setDone(next); localStorage.setItem('vl_checks', JSON.stringify(next))
  }
  const navProgress = NAV.flatMap((g) => g.items).find((n) => n.s === section)?.p || 0
  const pct = Math.min(100, navProgress + Math.round(done.length / DEFAULT_CHECKS.length * 30))
  const isAdmin = view === 'admin'

  if (isAdmin) return <Admin onExit={() => go(section)} />

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo"><div className="logo-badge">V</div><div><b>VIBE LAB</b><small>BUILD · TEST · SHIP</small></div></div>
        <div className="tagline">INTERACTIVE LEARNING MAP</div>
        <nav>
          {NAV.map((g) => (
            <div className="nav-group" key={g.group}>
              <h4>{g.group}</h4>
              {g.items.map((n) => (
                <a key={n.s} className={'nav-item' + (section === n.s ? ' active' : '')} onClick={() => go(n.s)}>
                  <span className="num">{n.num}</span>{n.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-note"><b>别只收藏，动手做一个。</b>每一个模块，试着把里面的方法用在你自己的项目里，才是真的学会。</div>
      </aside>

      <div className="main">
        <div className="topbar">
          <span className="pill">◈ INTERACTIVE LEARNING MAP</span>
          <span className="flex items-center gap-2.5">
            <a className="pill" style={{ cursor: 'pointer' }} onClick={() => { setView('admin'); history.replaceState(null, '', '#/admin') }}>⚙ 管理内容</a>
            <span className="pill">学习进度 <span className="progress"><i style={{ width: pct + '%' }} /></span> <b>{pct}%</b></span>
          </span>
        </div>
        <div className="content">

          {section === 'map' && (
            <section className="section">
              <div className="hero">
                <span className="badge">A PRACTICAL PLAYBOOK · 2026</span>
                <h1>从一句想法，<br />到一个<span style={{ background: 'var(--lime)', padding: '0 8px' }}>能上线的产品</span></h1>
                <p className="lead !mb-0">Vibe Coding 不是让其"帮你写代码"，而是要你学会提需求、给上下文、拆解任务、验收结果，最后形成一个真正能用的产品交付给用户使用。</p>
                <div className="hero-stats">
                  <div><b>{data.modules.length || 11}</b><span>学习章节</span></div>
                  <div><b>5</b><span>常用 AI 编程工具</span></div>
                  <div><b>0 → 1</b><span>从想法到上线</span></div>
                </div>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--lime)' }}>
                <h3>💡 先建立正确理解</h3>
                <p>AI 智能编程不等于"不用学技术"。它的核心是：你提供清晰目标、拆解任务、验收结果；AI 提供速度和执行力。先把工作流跑顺，再谈效率。</p>
              </div>
              <h2 className="!mt-8 !mb-1">先选一条适合自己的路线</h2>
              <p className="lead">三条路线对应三种人：想快速做出产品的人、想系统掌握的人、已经有技术基础想提效的人。</p>
              <div className="grid g3">
                <div className="card"><h3>🚀 产品/project 优先</h3><p>直接做一个真实的小项目，边做边学，遇到什么补什么。</p><span className="chip">适合：想快速出成果</span></div>
                <div className="card"><h3>📚 知识体系优先</h3><p>先看核心知识模块，建立概念框架，再进入项目实战。</p><span className="chip">适合：想系统掌握</span></div>
                <div className="card"><h3>⚡ 提效优先</h3><p>已有技术基础，重点看工作流、Prompt 模板和工具链。</p><span className="chip">适合：开发者提效</span></div>
              </div>
              <div className="next"><button className="btn" onClick={() => go('route')}>开始 → 选择学习路线</button></div>
            </section>
          )}

          {section === 'route' && (
            <section className="section">
              <p className="kicker">02 / CHOOSE YOUR ROUTE</p>
              <h1>选择学习路线</h1>
              <p className="lead">不同目标对应不同路径。选一条主线走完，再回头补其他模块。</p>
              <div className="grid g2">
                {ROUTES.map((r) => (
                  <div className="card" key={r.title}><h3>{r.icon} {r.title}</h3><p>{r.desc}</p><span className="chip">{r.chip}</span></div>
                ))}
              </div>
              <div className="next"><button className="btn" onClick={() => go('flowmap')}>查看完整学习地图 →</button></div>
            </section>
          )}

          {section === 'flowmap' && (
            <section className="section">
              <p className="kicker">03 / THE LEARNING MAP</p>
              <h1>一张图看懂完整学习路径</h1>
              <p className="lead">从认识 Vibe Coding，到第一阶段做出第一个可用的产品。不只是看内容，更要动手。</p>
              <div className="grid g2">
                {STAGES.map((s, i) => (
                  <div className="card" key={i}>
                    <span className="num-badge" style={s.color ? { color: s.color } : {}}>STAGE {String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.title}</h3><p>{s.desc}</p><span className="chip">进入学习 →</span>
                  </div>
                ))}
              </div>
              <h2 className="!mt-9 !mb-1">核心知识模块预览</h2>
              <p className="lead">模块内容可在「核心知识模块」页查看与管理，支持随时增删。</p>
              <div className="grid g2">
                {data.modules.slice(0, 2).map((m) => (
                  <div className="card" key={m.title}><h3>{m.icon} {m.title}</h3><p>{m.summary}</p><span className="chip">产出：{m.output}</span></div>
                ))}
              </div>
              <div className="next"><button className="btn" onClick={() => go('knowledge')}>进入核心知识模块 →</button></div>
            </section>
          )}

          {section === 'knowledge' && (
            <section className="section">
              <p className="kicker">04 / CORE KNOWLEDGE</p>
              <h1>核心知识模块</h1>
              <p className="lead">按推荐顺序排列。每学完一个卡片，可以接着学习下一个，也可以随时跳到需要的模块。</p>
              <div className="grid g2">
                {data.modules.map((m) => (
                  <div className="card" key={m.title}>
                    <h3>{m.icon} {m.title}</h3>
                    <p>{m.summary}</p>
                    {m.points?.length > 0 && (<><h3 style={{ marginTop: 12, fontSize: 13 }}>要点</h3><p>{m.points.map((p) => '· ' + p).join('　')}</p></>)}
                    {m.output && <span className="chip">产出：{m.output}</span>}
                  </div>
                ))}
              </div>
              <div className="next"><button className="btn" onClick={() => go('workflow')}>进入标准开发工作流 →</button></div>
            </section>
          )}

          {section === 'workflow' && (
            <section className="section">
              <p className="kicker">05 / THE BUILD LOOP</p>
              <h1>真正好用的 Vibe Coding 工作流</h1>
              <p className="lead">不是"一句话让 AI 帮我写代码"，而是有节奏、有阶段、有反馈的小闭环。每一步都让下一个环节更轻松，循环推进。这是一个<b>可复用的流程（Repeatable Process）</b>。</p>
              <div className="flow">
                {['定义问题|清晰、具体、可验收', '写需求档|功能描述 · 数据结构 · 交互逻辑', '拆分任务|小步提交 · 每步可回退', '生成页面|先做所有页面，逐步调整', '迭代细化|测一遍 · 改一遍 · 再测一遍', '交付上线|部署 · 域名 · 收集反馈'].map((x) => {
                  const [t, d] = x.split('|')
                  return <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
                })}
              </div>
              <div className="grid g2 !mb-7">
                <div className="card" style={{ borderLeft: '4px solid var(--blue)' }}>
                  <h3>一次只交一件事给 AI</h3>
                  <p>不要一开始就"给我做个 App"。先写清楚：用户是谁、做什么、页面有哪些、数据存哪里。需求描述越清楚，生成越稳定。改需求时也一样：一次只改一件事，改完测一遍再继续。</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--lime)' }}>
                  <h3>先做最重要的核心闭环</h3>
                  <p>先用最短路径让产品"能用"：一个页面能提交、能看到结果。再补登录、再补美化。不要一上来就做权限、做支付——先把核心闭环跑通，再一轮一轮往外扩。</p>
                </div>
              </div>
              <h2 style={{ marginBottom: 4 }}>Vibe Coding 完整工作流</h2>
              <p className="lead">10 步 · 从想法到上线。</p>
              {FLOW_STEPS.map((ph) => (
                <div className="phase" key={ph.phase}>
                  <div className="phase-head"><span className="dot" style={{ background: ph.dot }} /><b>{ph.phase}</b><span>{ph.steps.length} 步</span></div>
                  {ph.steps.map(([no, t, d]) => (
                    <div className="step" key={no}><span className="no">{no}</span><div className="t"><b>{t}</b></div><div className="d">{d}</div></div>
                  ))}
                </div>
              ))}
              <div className="next"><button className="btn" onClick={() => go('projects')}>进入项目实战 →</button></div>
            </section>
          )}

          {section === 'projects' && (
            <section className="section">
              <p className="kicker">06 / PROJECT STUDIO</p>
              <h1>项目实战：从小作品到完整产品</h1>
              <p className="lead">{data.projects.length} 个 Hands-on Project。按顺序做，每完成一个项目，你的工作流就更熟练一次。</p>
              <div className="grid g2">
                {data.projects.map((p, i) => (
                  <div className="card" key={i}>
                    <span className="num-badge" style={{ color: p.color }}>PROJECT {String(i + 1).padStart(2, '0')}</span>
                    <div style={{ height: 90, borderRadius: 12, background: p.grad || 'linear-gradient(135deg,#e8ecff,#f6f0ff)', margin: '10px 0' }} />
                    <h3>{p.title}</h3><p>{p.desc}</p>
                    {p.chips?.map((c) => <span className="chip" key={c}>{c}</span>)}
                    {p.prep?.length > 0 && (<><p style={{ marginTop: 10 }}><b>要做的准备：</b></p><p>{p.prep.map((x) => '· ' + x).join('　')}</p></>)}
                  </div>
                ))}
              </div>
              <div className="next"><button className="btn" onClick={() => go('stack')}>查看工具与技术栈 →</button></div>
            </section>
          )}

          {section === 'stack' && (
            <section className="section">
              <p className="kicker">07 / TOOLS &amp; STACK</p>
              <h1>工具与技术栈</h1>
              <p className="lead">按项目阶段选工具，不追新、不堆栈。</p>
              <div className="grid g2">
                <div className="card"><h3>AI 编程工具</h3><p><b>Claude Code</b> · 终端 Agent，适合整套项目与重构<br /><b>Cursor</b> · AI IDE，边写边改体验好<br /><b>Codex / Cline</b> · 轻量替代，按需选择</p></div>
                <div className="card"><h3>前端</h3><p>React + Vite + Tailwind（本站同款）；原生三件套适合练手与理解原理。</p></div>
                <div className="card"><h3>后端与数据</h3><p>Supabase（数据库 + 登录 + 存储，最适合个人项目）；复杂逻辑再上 Node/Python 服务。</p></div>
                <div className="card"><h3>部署</h3><p>Vercel / Netlify / GitHub Pages 一键部署；自定义域名 + HTTPS；生产数据库单独管理。</p></div>
              </div>
              <div className="next"><button className="btn" onClick={() => go('prompts')}>进入 Prompt 模板库 →</button></div>
            </section>
          )}

          {section === 'prompts' && (
            <section className="section">
              <p className="kicker">08 / PROMPT LIBRARY</p>
              <h1>可直接拿去用的 Prompt 模板</h1>
              <p className="lead">复制、替换方括号里的内容，直接发给 AI。每个模板都标了使用时机。</p>
              <div className="grid g2">
                {data.prompts.map((t, i) => (
                  <div className="card" key={i}>
                    <span className="num-badge" style={{ color: t.color }}>{String(i + 1).padStart(2, '0')} / {t.title}</span>
                    <div className="prompt">{t.prompt}</div>
                  </div>
                ))}
              </div>
              <h2 className="!mt-9 !mb-1">常见问题排查手册</h2>
              <p className="lead">遇到问题先对号入座，大多数问题都是这几类。</p>
              <div className="grid g2">
                {TROUBLES.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}
              </div>
              <div className="next"><button className="btn" onClick={() => go('checklist')}>查看交付检查清单 →</button></div>
            </section>
          )}

          {section === 'checklist' && (
            <section className="section">
              <p className="kicker">09 / QUALITY GATE</p>
              <h1>项目交付前，逐项打勾</h1>
              <p className="lead">这套检查清单为了防止"看起来能用"的产品一路带病上线。勾选状态自动保存在你的浏览器。</p>
              <div>
                {DEFAULT_CHECKS.map(([t, d], i) => (
                  <div className={'check' + (done.includes(i) ? ' done' : '')} key={i} onClick={() => toggleCheck(i)}>
                    <span className="box">✓</span>
                    <div className="t"><b>{t}</b><br />{d}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">⚠️ 安全提示：不要在浏览器端保存 API key，也不要把生产数据库的管理员权限交给前端页面。</p>
              <h2 className="!mt-10 !mb-1">常用技术词典</h2>
              <p className="lead">不用一次性背下来，用到时回来查就行。</p>
              <div className="dict-grid">
                {DICT.map(([t, d]) => <div className="card" key={t}><b>{t}</b><p>{d}</p></div>)}
              </div>
              <div className="next"><button className="btn" onClick={() => go('map')}>回到学习地图 ↑</button></div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
