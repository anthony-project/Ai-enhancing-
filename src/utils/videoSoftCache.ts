/**
 * Ultra-Fast In-Memory Video Soft-Cache & Segment Pre-Loader Engine
 * 
 * Features:
 * 1. Segment Range Tracking: Inspects and monitors HTML5 Video buffered TimeRanges in RAM.
 * 2. Pre-warming Worker: Silently primes downstream video segments ahead of playhead.
 * 3. Seamless Loop Segment Caching: Pre-caches 0.0s loop boundary to eliminate playback freeze on cycle repeat.
 * 4. Keyframe Ring Cache: Volatile memory frame buffer for instant lag-free scrubbing.
 * 5. Zero-Storage Compliance: Volatile RAM only; cleared immediately on unmount or media reset.
 */

import { VideoEnhanceOptions, renderEnhancedVideoFrame } from './videoEnhancer';

export interface BufferedRange {
  start: number;
  end: number;
}

export class VideoSoftCacheManager {
  private videoSrc: string;
  private options: VideoEnhanceOptions;
  private prewarmVideo: HTMLVideoElement | null = null;
  private keyframeCache: Map<number, string> = new Map();
  private maxCacheSize: number = 32;
  private isPrewarming: boolean = false;

  constructor(videoSrc: string, options: VideoEnhanceOptions) {
    this.videoSrc = videoSrc;
    this.options = options;
    this.initPrewarmWorker();
  }

  private initPrewarmWorker() {
    try {
      this.prewarmVideo = document.createElement('video');
      this.prewarmVideo.src = this.videoSrc;
      this.prewarmVideo.preload = 'auto';
      this.prewarmVideo.muted = true;
      this.prewarmVideo.playsInline = true;
      this.prewarmVideo.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
      document.body.appendChild(this.prewarmVideo);

      this.prewarmVideo.onloadedmetadata = () => {
        this.prewarmSegments();
      };
    } catch {
      // Graceful fallback if background video creation is restricted
    }
  }

  /**
   * Pre-warms initial and loop-boundary video segments into browser decode buffer
   */
  public prewarmSegments() {
    if (!this.prewarmVideo || this.isPrewarming) return;
    this.isPrewarming = true;

    const dur = this.prewarmVideo.duration;
    if (dur && isFinite(dur) && dur > 0) {
      // Pre-warm loop start point (0.0s) and midpoints
      const checkPoints = [0.1, Math.min(dur * 0.25, 2.0), Math.min(dur * 0.5, 4.0), Math.max(0.1, dur - 0.2)];
      
      let step = 0;
      const primeNext = () => {
        if (step >= checkPoints.length || !this.prewarmVideo) {
          this.isPrewarming = false;
          return;
        }
        const target = checkPoints[step++];
        this.prewarmVideo.currentTime = target;
      };

      this.prewarmVideo.onseeked = () => {
        // Cache high-speed thumbnail for this segment
        if (this.prewarmVideo && this.keyframeCache.size < this.maxCacheSize) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(480, this.prewarmVideo.videoWidth || 480);
            canvas.height = Math.min(270, this.prewarmVideo.videoHeight || 270);
            renderEnhancedVideoFrame(this.prewarmVideo, canvas, this.options);
            const timeKey = Math.round(this.prewarmVideo.currentTime * 10) / 10;
            this.keyframeCache.set(timeKey, canvas.toDataURL('image/jpeg', 0.85));
          } catch {}
        }
        primeNext();
      };

      primeNext();
    } else {
      this.isPrewarming = false;
    }
  }

  /**
   * Returns active buffered ranges of the video element
   */
  public static getBufferedRanges(video: HTMLVideoElement | null): BufferedRange[] {
    if (!video || !video.buffered || video.buffered.length === 0) return [];
    const ranges: BufferedRange[] = [];
    for (let i = 0; i < video.buffered.length; i++) {
      ranges.push({
        start: video.buffered.start(i),
        end: video.buffered.end(i),
      });
    }
    return ranges;
  }

  /**
   * Computes overall percentage of video segments buffered in memory
   */
  public static getBufferedPercentage(video: HTMLVideoElement | null): number {
    if (!video || !video.duration || !isFinite(video.duration) || video.duration <= 0) return 0;
    const ranges = this.getBufferedRanges(video);
    let totalBufferedTime = 0;
    for (const r of ranges) {
      totalBufferedTime += Math.max(0, r.end - r.start);
    }
    return Math.min(100, Math.round((totalBufferedTime / video.duration) * 100));
  }

  /**
   * Retrieves a cached keyframe preview if available in memory
   */
  public getKeyframe(time: number): string | null {
    const key = Math.round(time * 10) / 10;
    return this.keyframeCache.get(key) || null;
  }

  /**
   * Destroys worker and purges all in-memory segment buffers
   */
  public destroy() {
    this.keyframeCache.clear();
    if (this.prewarmVideo) {
      if (this.prewarmVideo.parentNode) {
        this.prewarmVideo.parentNode.removeChild(this.prewarmVideo);
      }
      this.prewarmVideo.src = '';
      this.prewarmVideo.load();
      this.prewarmVideo = null;
    }
  }
}
