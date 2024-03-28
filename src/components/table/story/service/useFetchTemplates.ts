import axios from 'axios'
import { useEffect, useState } from 'react'
import type { ITemplate } from './types'
import { TemplatesQuery } from './Templates.query'

export const useFetchTemplates = () => {
    const [data, setData] = useState<ITemplate[]>([])

    useEffect(() => {
        const getDatadata = async () => {
            const res = await axios<{ data: { templates: ITemplate[] } }>({
                method: 'post',
                headers: {
                    'x-hasura-admin-secret': import.meta.env['STORYBOOK_PROXY_SECRET'],
                },
                url: import.meta.env['STORYBOOK_PROXY_ENDPOINT'],
                data: TemplatesQuery,
            })

            setData(res.data.data.templates)
        }

        getDatadata()
    }, [])

    return { data }
}
