import ExpoModulesCore

public final class ExpoFlagsKitModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoFlagsKit")

    Function("getRegionName") { (code: String, locale: String?) -> String? in
      (locale.map(Locale.init(identifier:)) ?? .current).localizedString(forRegionCode: code)
    }

    View(FlagView.self) {
      Prop("code") { (view: FlagView, code: String?) in
        view.code = code
      }

      Prop("contentFit") { (view: FlagView, contentFit: FlagContentFit?) in
        view.contentFit = contentFit ?? .cover
      }
    }
  }
}
