type Event = {
    name: string,
    once?: boolean,
    execute(...args: any[]): void
}
export {Event};