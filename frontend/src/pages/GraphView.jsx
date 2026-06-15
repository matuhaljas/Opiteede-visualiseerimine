import { useMemo } from 'react'

const SUBJECT_COLORS = [0x7c8aff, 0x4ecfb3, 0xff8a65, 0xf06292, 0xa5d06a, 0xffd54f, 0x9575cd, 0x4fc3f7]

const GRADE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(k => `${k}. klass`)

function hexCss(hex) {
  return '#' + hex.toString(16).padStart(6, '0')
}

export default function GraphView({ knowbits, skillbits, filtrid, otsing, selectedSubject }) {
  const allSubjects = useMemo(() => {
    const seen = []
    ;[...knowbits, ...skillbits].forEach(y => {
      const s = y.subject || 'Määramata'
      if (!seen.includes(s)) seen.push(s)
    })
    return seen
  }, [knowbits, skillbits])

  function subjectColor(subjectName) {
    const idx = allSubjects.indexOf(subjectName || 'Määramata')
    return hexCss(SUBJECT_COLORS[(idx >= 0 ? idx : 0) % SUBJECT_COLORS.length])
  }

  const items = useMemo(() => {
    const q = otsing?.toLowerCase() ?? ''
    return [
      ...(filtrid.knowbits ? knowbits.map(k => ({ ...k, unitType: 'KnowBit' })) : []),
      ...(filtrid.skillbits ? skillbits.map(s => ({ ...s, unitType: 'SkillBit' })) : []),
    ]
      .filter(y => !selectedSubject || y.subject === selectedSubject)
      .filter(y =>
        !q ||
        (y.title ?? '').toLowerCase().includes(q) ||
        (y.description ?? '').toLowerCase().includes(q)
      )
  }, [knowbits, skillbits, filtrid, otsing, selectedSubject])

  const grouped = useMemo(() => {
    const map = new Map()
    GRADE_ORDER.forEach(g => map.set(g, []))
    items.forEach(y => {
      const g = y.gradeLevel || 'Määramata'
      if (!map.has(g)) map.set(g, [])
      map.get(g).push(y)
    })
    return [...map.entries()].filter(([, list]) => list.length > 0)
  }, [items])

  if (grouped.length === 0) {
    return (
      <div style={{ background: '#fff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.95rem' }}>
        Ühikuid ei leitud.
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
      {grouped.map(([grade, rows]) => (
        <div key={grade} style={{ marginBottom: '28px' }}>
          <div style={{
            fontWeight: 700,
            color: '#003082',
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderLeft: '3px solid #003082',
            paddingLeft: '10px',
            marginBottom: '10px',
          }}>
            {grade}
          </div>
          {rows.map(y => {
            const color = subjectColor(y.subject)
            const isKnow = y.unitType === 'KnowBit'
            return (
              <div
                key={`${y.unitType}-${y.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  background: '#f8f9fb',
                  border: '1px solid #eaecf0',
                  borderRadius: '7px',
                  marginBottom: '6px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,48,130,0.10)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: '4px', background: color, flexShrink: 0 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', flex: 1, flexWrap: 'wrap', minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#003082',
                    border: '1px solid #c7d5f0',
                    borderRadius: '10px',
                    padding: '2px 9px',
                    whiteSpace: 'nowrap',
                    background: '#f0f4ff',
                  }}>
                    {grade}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {y.title}
                  </span>
                  {y.description && (
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                      {y.description}
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isKnow ? '#003082' : '#2e7d32',
                    border: `1px solid ${isKnow ? '#003082' : '#2e7d32'}`,
                    borderRadius: '10px',
                    padding: '2px 9px',
                    whiteSpace: 'nowrap',
                    background: isKnow ? '#f0f4ff' : '#f0fff4',
                  }}>
                    {y.unitType}
                  </span>
                  <span style={{ fontSize: '0.78rem', color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {y.subject || 'Määramata'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
