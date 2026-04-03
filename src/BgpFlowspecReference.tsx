import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Zap, Copy, CheckCircle2 } from 'lucide-react'

const translations = {
  en: {
    title: 'BGP FlowSpec Reference',
    subtitle: 'Complete reference for BGP FlowSpec (RFC 8955) match fields, actions and vendor implementation examples.',
    matchFields: 'Match Fields',
    actions: 'Actions',
    examples: 'Vendor Examples',
    copy: 'Copy',
    copied: 'Copied!',
    type: 'Type',
    description: 'Description',
    format: 'Format / Values',
    builtBy: 'Built by',
    references: 'References',
    refList: [
      'RFC 8955 – Dissemination of Flow Specification Rules',
      'RFC 8956 – Dissemination of Flow Specification Rules for IPv6',
      'RFC 5575 – Dissemination of Flow Specification Rules (obsoleted)',
    ],
  },
  pt: {
    title: 'Referencia BGP FlowSpec',
    subtitle: 'Referencia completa para campos de correspondencia, acoes e exemplos de implementacao por fornecedor do BGP FlowSpec (RFC 8955).',
    matchFields: 'Campos de Correspondencia',
    actions: 'Acoes',
    examples: 'Exemplos por Fornecedor',
    copy: 'Copiar',
    copied: 'Copiado!',
    type: 'Tipo',
    description: 'Descricao',
    format: 'Formato / Valores',
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: [
      'RFC 8955 – Disseminacao de Regras de Especificacao de Fluxo',
      'RFC 8956 – Disseminacao de Regras de Especificacao de Fluxo para IPv6',
      'RFC 5575 – (obsoleto por RFC 8955)',
    ],
  },
} as const

type Lang = keyof typeof translations

const matchFields = [
  { type: 'Type 1', name: 'Destination Prefix', desc: 'Match packets by destination IP prefix', format: 'CIDR notation (e.g. 192.0.2.0/24)' },
  { type: 'Type 2', name: 'Source Prefix', desc: 'Match packets by source IP prefix', format: 'CIDR notation (e.g. 10.0.0.0/8)' },
  { type: 'Type 3', name: 'IP Protocol', desc: 'Match IP protocol number', format: '6 (TCP), 17 (UDP), 1 (ICMP), 47 (GRE), 89 (OSPF)' },
  { type: 'Type 4', name: 'Port', desc: 'Match source or destination port', format: 'Numeric (0-65535), ranges (80-443), operators (=, >, <, >=, <=, !=)' },
  { type: 'Type 5', name: 'Destination Port', desc: 'Match destination port only', format: 'Numeric (0-65535), operators supported' },
  { type: 'Type 6', name: 'Source Port', desc: 'Match source port only', format: 'Numeric (0-65535), operators supported' },
  { type: 'Type 7', name: 'ICMP Type', desc: 'Match ICMP message type', format: '0 (echo-reply), 8 (echo-request), 3 (unreachable), 11 (ttl-exceeded)' },
  { type: 'Type 8', name: 'ICMP Code', desc: 'Match ICMP message code', format: 'Numeric 0-255, depends on ICMP type' },
  { type: 'Type 9', name: 'TCP Flags', desc: 'Match TCP control flags', format: 'syn, ack, fin, rst, urg, psh — bitmask or named' },
  { type: 'Type 10', name: 'Packet Length', desc: 'Match total IP packet length', format: 'Numeric (bytes), operators: =, >, <, >=, <=, !=' },
  { type: 'Type 11', name: 'DSCP', desc: 'Match Differentiated Services Code Point', format: 'Numeric 0-63 (e.g. 46 = EF, 0 = BE, 8 = CS1)' },
  { type: 'Type 12', name: 'Fragment', desc: 'Match IP fragment flags', format: 'is-fragment, first-fragment, last-fragment, dont-fragment' },
]

const actions = [
  { name: 'Traffic Rate (rate-limit)', community: '0x8006 / traffic-rate', desc: 'Rate-limit matching traffic. Value in bytes/second. Rate 0 = drop.', example: 'traffic-rate 0 (drop), traffic-rate 1000000 (1 Mbps limit)' },
  { name: 'Traffic Action', community: '0x8007 / traffic-action', desc: 'Perform actions: sample traffic or terminal action (stop processing).', example: 'traffic-action sample, traffic-action terminal' },
  { name: 'Redirect VRF', community: '0x8008 / redirect', desc: 'Redirect matching flows to a different VRF by route-target.', example: 'redirect 65000:100 (to VRF with RT 65000:100)' },
  { name: 'Traffic Marking (DSCP)', community: '0x8009 / traffic-marking', desc: 'Re-mark DSCP field on matching packets.', example: 'traffic-marking dscp 46 (mark as EF)' },
  { name: 'Redirect IP NH', community: '0x0800 / redirect-to-ip', desc: 'Redirect matching flows to a specific IP next-hop.', example: 'redirect-to-ip 192.168.1.1' },
]

const vendorExamples = [
  {
    name: 'Cisco IOS-XR',
    color: '#3b82f6',
    code: `! Define FlowSpec rule: block UDP port 53 amplification
flowspec
 address-family ipv4
  local-install interface-all
  !
class-map type traffic match-all FLOWSPEC_DROP
 match destination-address ipv4 192.0.2.0/24
 match protocol udp
 match destination-port 53
!
policy-map type pbr FLOWSPEC_POLICY
 class FLOWSPEC_DROP
  drop
!
! Apply via BGP FlowSpec:
router bgp 65000
 address-family ipv4 flowspec
  neighbor 192.168.1.1 activate`,
  },
  {
    name: 'Juniper JunOS',
    color: '#ef4444',
    code: `# FlowSpec rule: rate-limit source 203.0.113.0/24 to 10Mbps
set routing-options flow-route LIMIT_ATTACK
set routing-options flow-route LIMIT_ATTACK match source 203.0.113.0/24
set routing-options flow-route LIMIT_ATTACK match protocol udp
set routing-options flow-route LIMIT_ATTACK match destination-port 53
set routing-options flow-route LIMIT_ATTACK then traffic-rate 10000000

# BGP FlowSpec activation
set protocols bgp group FLOWSPEC family inet flow
set protocols bgp group FLOWSPEC neighbor 192.168.1.1`,
  },
  {
    name: 'FRRouting (FRR)',
    color: '#8b5cf6',
    code: `! FRR FlowSpec BGP configuration
router bgp 65000
 address-family ipv4 flowspec
  neighbor 192.168.1.1 activate
  neighbor 192.168.1.1 route-map FLOWSPEC-IN in
 exit-address-family

! View received FlowSpec rules
show bgp ipv4 flowspec detail

! FlowSpec statistics
show bgp flowspec`,
  },
]

export default function BgpFlowspecReference() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [activeTab, setActiveTab] = useState<'match' | 'actions' | 'examples'>('match')
  const [copiedKey, setCopiedKey] = useState('')

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedKey(key); setTimeout(() => setCopiedKey(''), 2000) })
  }

  const tabs = [
    { key: 'match' as const, label: t.matchFields },
    { key: 'actions' as const, label: t.actions },
    { key: 'examples' as const, label: t.examples },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-semibold">BGP FlowSpec Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/bgp-flowspec-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">RFC 8955</span>
            </div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'match' && (
            <div className="space-y-3">
              {matchFields.map(f => (
                <div key={f.type} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-mono font-semibold mt-0.5">{f.type}</span>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-sm">{f.name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
                      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">{t.format}</p>
                        <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{f.format}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              {actions.map(a => (
                <div key={a.name} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold">{a.name}</p>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{a.community}</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{a.desc}</p>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                    <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{a.example}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              {vendorExamples.map(v => (
                <div key={v.name} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-sm font-semibold" style={{ color: v.color }}>{v.name}</span>
                    <button onClick={() => copy(v.code, v.name)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-500 transition-colors">
                      {copiedKey === v.name ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                      {copiedKey === v.name ? t.copied : t.copy}
                    </button>
                  </div>
                  <pre className="px-4 py-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap bg-zinc-950 dark:bg-black leading-relaxed">{v.code}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
