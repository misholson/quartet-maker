import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store'
import { useGoogleLoginMutation } from '../store/apiSlice'
import { setCredentials } from '../store/authSlice'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
`

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
`

const Subtitle = styled.p`
  color: var(--text-link);
  margin: 0;
`

const ErrorMsg = styled.p`
  color: var(--danger-text);
  font-size: 0.9rem;
  margin: 0;
`

export default function LoginPage() {
  const token = useAppSelector(s => s.auth.token)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [googleLogin] = useGoogleLoginMutation()
  const [error, setError] = useState<string | null>(null)

  if (token) return <Navigate to="/my-songs" replace />

  async function handleSuccess(credential: string) {
    setError(null)
    try {
      const result = await googleLogin({ idToken: credential }).unwrap()
      dispatch(setCredentials(result))
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/my-songs'
      sessionStorage.removeItem('redirectAfterLogin')
      navigate(redirect, { replace: true })
    } catch (e) {
      console.debug(e);
      setError('Sign-in failed. Please try again.')
    }
  }

  return (
    <Page>
      <Title>Virtual Quartet BETA</Title>
      <Subtitle>Sign in to manage your song repertoire.</Subtitle>
      <GoogleLogin
        onSuccess={response => handleSuccess(response.credential!)}
        onError={() => setError('Google sign-in failed.')}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Page>
  )
}
