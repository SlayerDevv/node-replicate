import fetch from 'chiaki'
import Prediction from './Prediction.js'


function sleep(duration) {
	return new Promise(resolve =>
		setTimeout(resolve, duration)
	)
}


export default class Model {

	constructor(path, version) {
		this.path = path
		this.version = version
	}

	async predict(
		inputs, 
		{ 
			onUpdate = () => {},
		} = {},
		{
			pollingInterval = 500,
		} = {},
	) {
		let prediction = await this.createPrediction(inputs)

		while (! prediction.hasTerminalStatus()) {
			onUpdate(prediction)

			await sleep(pollingInterval)
			prediction = await prediction.load()
		}

		return prediction
	}

	async createPrediction(inputs) {

		return await fetch({
			hostname: 'replicate.com',
			path: `/api/models/${this.path}/versions/${this.version}/predictions`,
			method: 'POST',
			headers: { 
				'content-type': 'application/json', 
			},
			body: JSON.stringify({ inputs }),
		})
		.then(response => JSON.parse(response.body))
		.then(response => new Prediction(response))
	}
}
