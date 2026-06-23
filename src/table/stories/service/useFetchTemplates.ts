import { useEffect, useState } from 'react'
import type { ITemplate } from './types'
import { TemplatesQuery } from './Templates.query'

export const useFetchTemplates = () => {
    const [data, setData] = useState<ITemplate[]>([])

    useEffect(() => {
        const getDatadata = async () => {
            const response = await fetch(import.meta.env['STORYBOOK_PROXY_ENDPOINT'], {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-hasura-admin-secret': import.meta.env['STORYBOOK_PROXY_SECRET'],
                },
                body: JSON.stringify(TemplatesQuery),
            })

            const res = (await response.json()) as { data: { templates: ITemplate[] } }

            setData(res.data.templates)
        }

        void getDatadata()
    }, [])
    return { data }
}
