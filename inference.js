import {HfInference} from "@huggingface/inference";
import {Result} from "./utils.js";

export class Inference {
    constructor() {
        this.hfInference = new HfInference();
        this.queue = [];
    }
    addJob(job) {
        this.queue.push(job);
    }

    async getJobResult(job_id) {
        async function resolve(job) {
            const result = await this.hfInference.objectDetection({
                model: 'facebook/detr-resnet-50',
                data: job.blob
            });
            return {
                "result": result,
                "job_id": job.id
            }
        }
        let job;
        // Is the job first in the normal queue?
        if (this.queue.length > 0 && this.queue[0].id === job_id) {
            job = this.queue.shift();
        }
        if (job !== undefined) {
            return Result.Ok(await resolve(job));
        }

        return Result.Err("Job not found or is not first in queue");
    }

    getPositionInQueue(job_id) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].id === job_id) {
                return i + 1;
            }
        }
        return -1;
    }
}