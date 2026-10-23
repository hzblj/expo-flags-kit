import ExpoModulesCore
import UIKit

enum FlagContentFit: String, Enumerable {
  case contain
  case cover
  case fill

  var contentMode: UIView.ContentMode {
    switch self {
    case .contain: .scaleAspectFit
    case .cover: .scaleAspectFill
    case .fill: .scaleToFill
    }
  }
}

public final class FlagView: ExpoView {
  private let imageView = UIImageView()

  var code: String? {
    didSet {
      if code != oldValue {
        imageView.image = code.flatMap(FlagImages.image(code:))
      }
    }
  }

  var contentFit = FlagContentFit.cover {
    didSet {
      imageView.contentMode = contentFit.contentMode
    }
  }

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    imageView.contentMode = contentFit.contentMode
    imageView.clipsToBounds = true
    imageView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    imageView.frame = bounds
    // React Native draws borders in a sublayer; keep the flag below it, as Android clips it to the padding box.
    imageView.layer.zPosition = -1
    addSubview(imageView)
  }
}

private enum FlagImages {
  // CocoaPods copies the resource bundle next to the module's code: into the app bundle for static
  // frameworks, into the framework for dynamic ones.
  static let bundle = Bundle(for: FlagView.self)
    .url(forResource: "ExpoFlagsKit", withExtension: "bundle")
    .flatMap(Bundle.init(url:))

  // The catalog keeps the vector data, so UIImageView redraws the flag at whatever size it is shown.
  static func image(code: String) -> UIImage? {
    UIImage(named: code, in: bundle, compatibleWith: nil)
  }
}
