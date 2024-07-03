import { getMaxListeners } from "events"

const axios = require('axios')

const apiKey = '5ba3864c3947a55f559d0912eb2ccdc7'
const baseUrl = 'https://desktime.com/api/v2/json/projects'
const startProjectBaseUrl = 'https://desktime.com/api/v2/json/start-project'
const stopProjectBaseUrl = 'https://desktime.com/api/v2/json/stop-project'
const employeeDataBaseUrl = 'https://desktime.com/api/v2/json/employee'
const projectAlias: any = {
	tms: 'Test My Skills',
	vbx: 'VitaBotX',
	bj: 'BaubleJet',
	ze: 'Zenie',
	njs: 'NodeJS',
	dt: 'DeskTime',
	mc: 'Must Coverings',
	ca: 'Change Agents'
}
const startProject = async (alias: string, task: string) => {
	try {
		const response = await axios.get(startProjectBaseUrl, {
			params: {
				apiKey,
				...(projectAlias[alias] ? { project: projectAlias[alias] } : { project: alias }),
				...(task && { task })
			}
		})
		console.log('Project Started:', response.data.started)
	} catch (error) {
		console.error('Error Occured:', error)
	}
}

const stopProject = async (alias: string) => {
	try {
		const response = await axios.get(stopProjectBaseUrl, {
			params: {
				apiKey,
				...(projectAlias[alias] ? { project: projectAlias[alias] } : { project: alias }),
			}
		})
		console.log('Project Stopped:', response.data.stopped)
	} catch (error) {
		console.error('Error Occured:', error)
	}
}
const getMe = async () => {
	try {
		const me = await axios.get(employeeDataBaseUrl, { params: { apiKey } });
		const {
			name,
			group,
			activeProject: {
				project_title,
				task_title,
				duration
			}
		} = me.data
		const meInfo = [{
			'NAME': name,
			'GROUP': group,
			'PROJECT': project_title || 'NA',
			'TASK': task_title || 'NA',
			'DURATION': duration ? formatTime(duration) : 'NA'
		}]
		console.table(meInfo)
	} catch (error) {
		console.error('Error Occured:', error)
	}
}

const getProjects = async (arg: string | undefined) => {
	try {
		const me = await axios.get(employeeDataBaseUrl, { params: { apiKey } });
		if (!arg) {
			const {
				activeProject: {
					project_title,
					task_title,
					duration
				}
			} = me.data
			if (!project_title) {
				console.log('No active project')
				return
			}
			const projectInfo = [{
				'PROJECT': project_title || 'NA',
				'TASK': task_title || 'NA',
				'DURATION': duration ? formatTime(duration) : 'NA',
				'ACTIVE': true
			}]
			console.table(projectInfo)
			return
		}
		const activeProject = me.data.activeProject['project_id']
		const projectInfo = me.data.projects.map((project: any) => {
			const {
				project_title,
				task_title,
				duration
			} = project
			return {
				'PROJECT': project_title,
				'TASK': task_title || 'NA',
				'DURATION': formatTime(duration)
			}
		})
		console.table(projectInfo)
	} catch (error) {
		console.error('Error Occured:', error)
	}
}


const getStats = async () => {
	try {
		const me = await axios.get(employeeDataBaseUrl, { params: { apiKey } });
		const {
			isOnline,
			atWorkTime,
			desktimeTime,
			productiveTime,
			productivity,
			efficiency,
			onlineTime,
			offlineTime,
		} = me.data
		const statsInfo = [{
			'IS ONLINE': isOnline,
			'AT WORK': formatTime(atWorkTime),
			'DESK TIME': formatTime(desktimeTime),
			'PRODUCTIVE TIME': formatTime(productiveTime),
			'PRODUCTIVITY': productivity + '%',
			'EFFICIENCY': efficiency + '%',
			'ONLINE TIME': formatTime(onlineTime),
			'IDLE TIME': formatTime(offlineTime)
		}]
		console.table(statsInfo)
	} catch (error) {
		console.error('Error Occured:', error)
	}
}

const formatTime = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const remainingSeconds = seconds % 60
	return `${hours}:${minutes}:${remainingSeconds}`
}

enum dtCommand {
	get = 'get',
	start = 'start',
	stop = 'stop'
}

const main = (): void => {
	const command = (process.argv[2]) as dtCommand
	const arg1: string = process.argv[3]
	const arg2: string = process.argv[4]

	switch (command) {
		case dtCommand.start: 1
			if (!arg1) {
				console.warn('Required project alias')
				console.info('Usage: dtime st <project_alias> <task>')
				break
			}
			startProject(arg1, arg2)
			break
		case dtCommand.get:
			switch (arg1) {
				case '@me':
					getMe()
					break
				case '@projects':
					getProjects(arg2)
					break
				case '@stats':
					getStats()
					break
			}
			break
		case dtCommand.stop:
			stopProject(arg1)
			break
		default:
			console.log('Invalid command')
			break
	}
}

main()
