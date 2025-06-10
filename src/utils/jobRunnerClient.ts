import PubNub from 'pubnub';

interface JobMessage {
  jobId: string;
  script: string;
}

interface JobResponse {
  jobId: string;
  status: 'accepted' | 'rejected' | 'completed' | 'error';
  error?: string;
  output?: string;
}

export class JobRunnerClient {
  private pubnub: PubNub;
  private jobChannel: string;
  private responseChannel: string;
  private pendingJobs = new Map<string, {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    onAccepted?: () => void;
  }>();

  constructor() {
    const subscribeKey = import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY;
    const publishKey = import.meta.env.VITE_PUBNUB_PUBLISH_KEY;
    this.jobChannel = import.meta.env.VITE_PUBNUB_JOB_CHANNEL;
    this.responseChannel = import.meta.env.VITE_PUBNUB_RESPONSE_CHANNEL;

    if (!subscribeKey || !publishKey) {
      throw new Error('PubNub configuration missing. Please check your .env file.');
    }

    this.pubnub = new PubNub({
      subscribeKey,
      publishKey,
      userId: `web-client-${Math.random().toString(36).slice(2, 9)}`
    });

    // Create subscription to response channel
    const responseSubscription = this.pubnub.channel(this.responseChannel).subscription();
    responseSubscription.onMessage = (messageEvent) => {
      const response = messageEvent.message;
      if (this.isValidJobResponse(response)) {
        void this.handleJobResponse(response);
      }
    };
    responseSubscription.subscribe();
  }

  private isValidJobResponse(response: unknown): response is JobResponse {
    if (typeof response !== 'object' || response === null) {
      return false;
    }
    const { jobId, status } = response as JobResponse;
    return (
      typeof jobId === 'string' &&
      ['accepted', 'rejected', 'completed', 'error'].includes(status)
    );
  }

  private async handleJobResponse(response: JobResponse) {
    const pendingJob = this.pendingJobs.get(response.jobId);
    if (!pendingJob) {
      console.warn('Received response for unknown job:', response.jobId);
      return;
    }

    switch (response.status) {
      case 'accepted':
        if (pendingJob.onAccepted) pendingJob.onAccepted();
        break;
      case 'completed':
        this.pendingJobs.delete(response.jobId);
        pendingJob.resolve(response.output || "no output");
        break;
      case 'rejected':
      case 'error':
        this.pendingJobs.delete(response.jobId);
        pendingJob.reject(new Error(response.error || 'Job failed'));
        break;
    }
  }

  async executeScript(script: string): Promise<string> {
    const jobId = Math.random().toString(36).slice(2);
    const jobMessage: JobMessage = {
      jobId,
      script
    };

    return new Promise((resolve, reject) => {
      let acceptedReceived = false;
      let timeoutId: NodeJS.Timeout | undefined = undefined;

      const onAccepted = () => {
        acceptedReceived = true;
        if (timeoutId) clearTimeout(timeoutId);
      };

      timeoutId = setTimeout(() => {
        if (!acceptedReceived) {
          this.pendingJobs.delete(jobId);
          reject(new Error('Failed to submit script. The job runner is probably offline.'));
        }
      }, 3000);

      this.pendingJobs.set(jobId, {
        resolve,
        reject,
        onAccepted
      });

      this.pubnub
        .publish({
          channel: this.jobChannel,
          message: {
            ...jobMessage,
            type: 'job'  // Add a type field to make it a valid key-value payload
          }
        })
        .catch((error) => {
          this.pendingJobs.delete(jobId);
          reject(new Error(`Failed to submit job: ${error.message}`));
        });
    });
  }

  dispose() {
    const responseSubscription = this.pubnub.channel(this.responseChannel).subscription();
    responseSubscription.unsubscribe();
    this.pubnub.stop();
  }
}
