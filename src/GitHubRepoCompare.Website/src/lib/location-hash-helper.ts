import { addWindowEventListener } from './window-events';

const separator = ';';

export module LocationHashHelper {
    export function getHashRepos(): string[] {
        let splits = (location.hash || '')
            .slice(1)
            .split(separator)
			.map(x => (x || '').trim())
            .filter(x => isRepoFullNameValid(x));
        return splits;
    }

    export function createHash(repoItems: Array<any>): string {
        let fullNames = repoItems.slice(0, 6).map(x => x.full_name);

        let hash = fullNames.join(separator);
        return hash;
    }

    export function resetHash() {
        let currentPath = location.pathname;
        
        history.replaceState({}, null, currentPath);
    }

    export function subscribeHashChange(listener: (this: Window, ev: HashChangeEvent) => any): () => void {
        let cancel = addWindowEventListener('hashchange', listener);
        return cancel;
    }
}

function isRepoFullNameValid(fullName: string): boolean {
    let isValid = fullName && /.+\/.+/.test(fullName);
    return isValid;
}