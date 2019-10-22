
class JobSet {
  constructor() {
      this.map = new Map();
      this[Symbol.iterator] = this.values;
  }

  add(job) {
      this.map.set(job.id.toString(), job);
  }

  values() {
      return this.map.values();
  }

  delete(job) {
      return this.map.delete(job.id.toString());
  }
}