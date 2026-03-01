const PROJECT_PREFIX = 'roomify_project_'
const jsonResponse = (status, data) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

const jsonError = (status, message, extra = {}) => {
    return jsonResponse(status, { error: message, ...extra });
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch {
        return null;
    }
}


router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user.puter;

        if (!userPuter) return jsonError(401, 'Authentication failed.');

        const body = await request.json();
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) return jsonError(400, 'Project not found.');

        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        }
        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication Failed.');

        const key = `${PROJECT_PREFIX}${userId}:${project.id}`;
        await userPuter.kv.set(key, payload);

        return jsonResponse(200, { saved: true, id: project.id, project: payload });

    } catch (e) {
        console.error(e);
        return jsonError(500, 'Failed to save project', { message: 'Internal server error' });
    }
});

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed.');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed.');

        const projects = await userPuter.kv.list(`${PROJECT_PREFIX}${userId}:*`, true);
        return jsonResponse(200, { projects: projects.map(p => p.value) });
    } catch (e) {
        console.error(e);
        return jsonError(500, 'Failed to list projects', { message: 'Internal server error' });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed.');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed.');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required.');

        const key = `${PROJECT_PREFIX}${userId}:${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found.');

        return jsonResponse(200, { project });
    } catch (e) {
        console.error(e);
        return jsonError(500, 'Failed to get project', { message: 'Internal server error' });
    }
});