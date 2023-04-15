import { useState, useEffect } from 'react';
import { HomePage } from './pages/homepage';
import { ChatPage } from './pages/chat'
import { LogsPage } from './pages/logs'
import { ScriptsPage } from './pages/scripts'
import { WorkflowsPage } from './pages/workflows'

const getWindowPath = () => {
    return window.location.pathname.substring(1) || '';
}

const pushState = (url: string) => {
    window.history.pushState({}, '', url)
    window.dispatchEvent(new Event('popstate'))
}

const routerMap: { [name: string]: () => any } = {
    '': () => <HomePage />,
    'chat': () => <ChatPage />,
    'scripts': () => <ScriptsPage />,
    'workflows': () => <WorkflowsPage />,
    'logs': () => <LogsPage />,
}
export function RenderPage() {
    const [path, setPath] = useState('')
    useEffect(() => {
        setPath(getWindowPath())
        window.addEventListener('popstate', () => {
            console.log('popstate')
            setPath(getWindowPath())
        })
    }, [])
    return (
        <>
            {routerMap[path] && routerMap[path]()}
        </>
    )
}

const routerLinkClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    pushState(event.currentTarget.getAttribute('href') || '')
}

export function RouterLink({ url, text }: { url: string, text: string }) {
    return (
        <>
            <a href={url} onClick={(event: React.MouseEvent<HTMLElement>) => routerLinkClick(event)}>{text}</a>
        </>
    )
}

