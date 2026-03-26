// Simple event emitter for scroll-to-bottom events
type ScrollListener = () => void;

class ScrollManager {
  private listeners: ScrollListener[] = [];

  subscribe(listener: ScrollListener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  triggerScroll() {
    this.listeners.forEach(listener => listener());
  }
}

export const scrollManager = new ScrollManager();
