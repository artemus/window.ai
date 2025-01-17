import { Storage } from "@plasmohq/storage"

import { ModelID } from "~public-interface"

import { BaseManager } from "./base"

export const LLMLabels: { [K in ModelID]: string } = {
  [ModelID.GPT3]: "OpenAI: GPT-3.5",
  [ModelID.GPT4]: "OpenAI: GPT-4",
  [ModelID.GPTNeo]: "Together: GPT NeoXT 20B",
  [ModelID.Cohere]: "Cohere: Xlarge",
  [ModelID.Local]: "Local"
}

export const DefaultCompletionURL: { [K in ModelID]: string } = {
  [ModelID.GPT3]: "https://api.openai.com/v1/completions",
  [ModelID.GPT4]: "https://api.openai.com/v1/completions",
  [ModelID.GPTNeo]: "https://api.together.xyz/inference",
  [ModelID.Cohere]: "https://api.cohere.ai/generate",
  [ModelID.Local]: "http://127.0.0.1:8000/completions"
}

export const APIKeyURL: { [K in ModelID]: string | undefined } = {
  [ModelID.GPT3]: "https://platform.openai.com/account/api-keys",
  [ModelID.GPT4]: "https://platform.openai.com/account/api-keys",
  [ModelID.GPTNeo]: undefined,
  [ModelID.Cohere]: "https://dashboard.cohere.ai/api-keys",
  [ModelID.Local]: undefined
}

export interface Config {
  id: ModelID
  apiKey?: string
  completionUrl?: string
}

class ConfigManager extends BaseManager<Config> {
  protected defaultConfig: Storage

  constructor() {
    super("configs")

    this.defaultConfig = new Storage({
      area: "local"
    })
    this.defaultConfig.setNamespace(`configs-default-`)
  }

  init(id: ModelID): Config {
    return {
      id,
      completionUrl: DefaultCompletionURL[id]
    }
  }

  isIncomplete(config: Config): boolean {
    return (
      !config.completionUrl ||
      (![ModelID.Local, ModelID.GPTNeo].includes(config.id) && !config.apiKey)
    )
  }

  async setDefault(id: ModelID) {
    await this.defaultConfig.set("id", id)
  }

  async getDefault(): Promise<Config> {
    let id = (await this.defaultConfig.get("id")) as ModelID | undefined
    if (!id) {
      id = ModelID.GPT3
      await this.setDefault(id)
    }
    return (await this.get(id)) || this.init(id)
  }
}

export const configManager = new ConfigManager()
