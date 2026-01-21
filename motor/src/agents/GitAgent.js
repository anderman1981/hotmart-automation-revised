import simpleGit from 'simple-git';

class GitAgent {
    constructor(basePath = process.env.GIT_REPO_PATH || process.cwd()) {
        this.git = simpleGit(basePath);
        this.basePath = basePath;
        console.log('🤖 Git Agent: Initialized at ' + basePath);
    }

    async init() {
        try {
            const isRepo = await this.git.checkIsRepo();
            if (!isRepo) {
                console.log('🤖 Git Agent: Initializing new repository...');
                await this.git.init();
            }
            // Check status
            const status = await this.git.status();
            console.log(`🤖 Git Agent: On branch ${status.current}`);
            return { status: 'ready', branch: status.current };
        } catch (e) {
            console.error('❌ Git Init Error:', e.message);
            return { status: 'error', msg: e.message };
        }
    }

    async createBranch(type, name) {
        // types: feature, fix, test, release
        const validTypes = ['feature', 'fix', 'test', 'release'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid branch type. Use: ${validTypes.join(', ')}`);
        }

        const branchName = `${type}/${name}`;
        try {
            console.log(`🌿 Git Agent: Creating branch ${branchName}...`);
            // Switch to dev first to ensure we branch off latest dev
            await this.git.checkout('dev'); 
            await this.git.pull('origin', 'dev').catch(() => console.log('⚠️ No remote dev to pull, using local.'));
            
            await this.git.checkoutLocalBranch(branchName);
            console.log(`✅ Switched to ${branchName}`);
            return { status: 'success', branch: branchName };
        } catch (e) {
            console.error('❌ Create Branch Error:', e.message);
            return { status: 'error', msg: e.message };
        }
    }

    async autoCommit(message) {
        try {
            const status = await this.git.status();
            if (status.files.length === 0) {
                return { status: 'clean', msg: 'Nothing to commit' };
            }

            console.log(`💾 Git Agent: Compiling changes...`);
            await this.git.add('.');
            
            // Basic Conventional Commit enforcement could go here
            const commitMsg = `🤖 [AUTO] ${message || 'System update'}`;
            
            await this.git.commit(commitMsg);
            console.log(`✅ Committed: ${commitMsg}`);
            return { status: 'success', commit: commitMsg };
        } catch (e) {
             console.error('❌ Commit Error:', e.message);
             return { status: 'error', msg: e.message };
        }
    }
    
    async pushChanges() {
        try {
            const status = await this.git.status();
            console.log(`🚀 Git Agent: Pushing ${status.current}...`);
            await this.git.push(['-u', 'origin', status.current]);
            return { status: 'success' };
        } catch (e) {
             console.error('❌ Push Error:', e.message);
             return { status: 'error', msg: e.message };
        }
    }
    async getStatus() {
        try {
            const status = await this.git.status();
            return { 
                current: status.current,
                isClean: status.isClean(),
                totalChanges: status.files.length
            };
        } catch (e) {
            return { current: 'unknown', error: e.message };
        }
    }
}

export default new GitAgent();
