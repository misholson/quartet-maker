import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useJoinQuartetMutation } from '../store/apiSlice'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 1rem;
`

const ErrorMsg = styled.p`
  color: #c00;
`

export default function JoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const navigate = useNavigate()
  const [joinQuartet] = useJoinQuartetMutation()
  const [error, setError] = useState<string | null>(null)
  const didJoin = useRef(false)

  useEffect(() => {
    if (didJoin.current) return
    didJoin.current = true
    joinQuartet(inviteCode!)
      .unwrap()
      .then(quartet => navigate('/quartet', { replace: true, state: { selectQuartetId: quartet.id } }))
      .catch(() => setError('Invalid or expired invite link.'))
  }, [inviteCode]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Page><ErrorMsg>{error}</ErrorMsg></Page>
  return <Page><p>Joining quartet…</p></Page>
}
