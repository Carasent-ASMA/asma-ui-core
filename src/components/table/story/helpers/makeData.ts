import { faker } from '@faker-js/faker'

export type Person = {
    id: string
    firstName: string
    lastName: string
    age: number
    visits: number
    progress: number
    status: 'relationship' | 'complicated' | 'single'
    subRows?: Person[]
}

export type Participant = {
    id: string
    fullName: string
    activityId: string
    addedAt: string
}

const range = (len: number) => {
    const arr = []
    for (let i = 0; i < len; i++) {
        arr.push(i)
    }
    return arr
}

const newPerson = (): Person => {
    return {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        age: faker.number.int(40),
        visits: faker.number.int(1000),
        progress: faker.number.int(100),
        status: faker.helpers.shuffle<Person['status']>([
            'relationship',
            'complicated',
            'single',
        ])[0] as Person['status'],
    }
}

export function makeData(...lens: number[]) {
    const makeDataLevel = (depth = 0): Person[] => {
        const len = lens[depth]
        if (!len) return []
        return range(len).map((): Person => {
            return {
                ...newPerson(),
                subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
            }
        })
    }

    return makeDataLevel()
}

export function makeParticipantsData(...lens: number[]): Participant[] {
    const makeDataLevel = (depth = 0): Participant[] => {
        const len = lens[depth]
        if (!len) return []
        return range(len).map((): Participant => {
            return {
                id: crypto.randomUUID(),
                fullName: faker.person.fullName(),
                activityId: faker.number.int({ min: 1, max: 20000 }).toString(),
                addedAt: faker.date.past().toISOString(),
            }
        })
    }

    return makeDataLevel()
}
