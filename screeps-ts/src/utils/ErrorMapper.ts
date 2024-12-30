import _ from "lodash";

// 简化版的 source map consumer
class SimpleSourceMapConsumer {
  private mappings: Array<{
    generatedLine: number;
    generatedColumn: number;
    originalLine: number;
    originalColumn: number;
    name: string | null;
    source: string;
  }>;

  constructor(sourceMap: any) {
    this.mappings = [];
    try {
      // 尝试解析映射
      if (typeof sourceMap === "string") {
        sourceMap = JSON.parse(sourceMap);
      }
      // 这里可以添加更多的映射解析逻辑
    } catch (err) {
      console.log("Error parsing source map:", err);
    }
  }

  originalPositionFor({ line, column }: { line: number; column: number }) {
    // 查找最接近的映射
    const mapping = this.mappings.find(m => 
      m.generatedLine === line && m.generatedColumn <= column
    );

    if (mapping) {
      return {
        source: mapping.source,
        line: mapping.originalLine,
        column: mapping.originalColumn,
        name: mapping.name
      };
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  }

  destroy() {
    // 清理资源
    this.mappings = [];
  }
}

export class ErrorMapper {
  // 缓存消费者
  private static _consumer?: SimpleSourceMapConsumer;

  public static get consumer(): SimpleSourceMapConsumer {
    if (this._consumer == null) {
      // 在 Screeps 环境中，我们从全局对象获取 source map
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sourceMap = require("main.js.map");
        this._consumer = new SimpleSourceMapConsumer(sourceMap);
      } catch (err) {
        console.log("Could not load source map:", err);
        // 创建一个空的 consumer
        this._consumer = new SimpleSourceMapConsumer({
          version: 3,
          file: "main.js",
          sourceRoot: "",
          sources: ["main.ts"],
          names: [],
          mappings: "",
          sourcesContent: [""]
        });
      }
    }
    return this._consumer;
  }

  // 缓存已经映射的追踪
  private static _cache: { [key: string]: string } = {};

  /**
   * 使用源映射生成堆栈追踪，并生成可读的格式化错误消息。
   * @param {Error | string} error 要映射的错误对象或错误消息
   * @returns {string} 格式化的错误消息
   */
  public static sourceMappedStackTrace(error: Error | string): string {
    const stack: string = error instanceof Error ? (error.stack as string) : error;
    if (Object.prototype.hasOwnProperty.call(this._cache, stack)) {
      return this._cache[stack];
    }

    const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
    let match: RegExpExecArray | null;
    let outStack = error.toString();

    while ((match = re.exec(stack))) {
      if (match[2] === "main") {
        const pos = this.consumer.originalPositionFor({
          column: parseInt(match[4], 10),
          line: parseInt(match[3], 10)
        });

        if (pos.line != null) {
          if (pos.name) {
            outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
          } else {
            if (match[1]) {
              // 没有方法名但有 "at" 之前的文本
              outStack += `\n    ${match[1].trim()} (${pos.source}:${pos.line}:${pos.column})`;
            } else {
              // 没有方法名也没有 "at" 之前的文本
              outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
            }
          }
        } else {
          // 没有原始位置
          outStack += "\n    at " + match[0];
        }
      } else {
        // 不是 "main" 的文件
        outStack += "\n    at " + match[0];
      }
    }

    this._cache[stack] = outStack;
    return outStack;
  }

  public static wrapLoop(loop: () => void): () => void {
    return () => {
      try {
        loop();
      } catch (e: unknown) {
        if (e instanceof Error) {
          if ("sim" in Game.rooms) {
            const message = `Source maps don't work in the simulator - displaying original error`;
            console.log(`<span style='color:red'>${message}<br>${_.escape(e.stack)}</span>`);
          } else {
            const stack = this.sourceMappedStackTrace(e);
            console.log(`<span style='color:red'>${_.escape(stack)}</span>`);
          }
        } else {
          // 不是 Error 对象，直接打印
          const errorString = typeof e === 'object' ? JSON.stringify(e) : String(e);
          console.log(`<span style='color:red'>Caught unknown exception: ${_.escape(errorString)}</span>`);
        }
      }
    };
  }
}
