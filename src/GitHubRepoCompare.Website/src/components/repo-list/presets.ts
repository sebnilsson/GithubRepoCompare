import { autoinject, computedFrom } from 'aurelia-framework';

import { Alerts } from '../../lib/alerts';
import { localStorage, LocalStorageObserver } from '../../lib/local-storage';
import { GitHubRepos } from '../../services/git-hub-repos';

@autoinject
export class Presets {
    private _presets: Array<IPreset> = getPresets();

    constructor(private alerts: Alerts,
        private localStorageObserver: LocalStorageObserver,
        private repos: GitHubRepos) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = true;

    @computedFrom('_presets')
    get presets(): Array<IPreset> {
        return this._presets;
    }
    
    selectPreset(preset: IPreset) {
        this.repos.setRepos(preset.repos)
            .catch(error => {
                let message = `Failed to load preset '${preset.name}': ${(error || {}).message || ''}`;

                this.alerts.addDanger(message);
            });
    }

    selectDefaultPreset() {
        this.selectPreset(this.presets[3]);
    }
}

interface IPreset {
    name: string;
    repos: Array<string>;
}

function getPresets(): Array<IPreset> {
    // https://github.com/showcases

    let presets = [
        {
            name: 'Front-end JS frameworks',
            repos: [
                'angular/angular',
                'aurelia/framework',
                'jashkenas/backbone',
                'emberjs/ember.js',
                'facebook/react',
                'knockout/knockout',
                'polymer/polymer'
            ]
        },
        {
            name: 'CSS preprocessors',
            repos: [
                'less/less.js',
                'sass/sass',
                'stylus/stylus',
                'sass/libsass'
            ]
        },
        {
            name: 'Programming languages',
            repos: [
                'dotnet/roslyn',
                'apple/swift',
                'erlang/otp',
                'golang/go',
                'ruby/ruby',
                'scala/scala'
            ]
        },
        {
            name: 'Text editors',
            repos: [
                'atom/atom',
                'vim/vim',
                'adobe/brackets',
                'textmate/textmate',
                'Microsoft/vscode'
            ]
        },
        {
            name: 'DevOps',
            repos: [
                'ansible/ansible',
                'chef/chef',
                'puppetlabs/puppet',
                'mitchellh/vagrant'
            ]
        },
        {
            name: 'NoSQL databases',
            repos: [
                'antirez/redis',
                'rethinkdb/rethinkdb',
                'mongodb/mongo',
                'neo4j/neo4j',
                'apache/couchdb',
                'ravendb/ravendb',
            ]
        },
        {
            name: 'Package managers',
            repos: [
                'apple/swift-package-manager',
                'npm/npm',
                'NuGet/Home',
                'rubygems/rubygems'
            ]
        }
    ];

    for (let key in presets) {
        if (presets.hasOwnProperty(key)) {
            let preset = presets[key];

            preset.repos.sort();
        }
    }

    return presets;
}