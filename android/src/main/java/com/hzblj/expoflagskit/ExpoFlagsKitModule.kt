package com.hzblj.expoflagskit

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Locale

class ExpoFlagsKitModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoFlagsKit")

    Function("getRegionName") { code: String, locale: String? ->
      val displayLocale = locale?.let(Locale::forLanguageTag) ?: Locale.getDefault()

      // Locale.Builder rejects anything that isn't a region code; the display name falls back to the code.
      runCatching { Locale.Builder().setRegion(code).build().getDisplayCountry(displayLocale) }
        .getOrNull()
        ?.takeIf { it.isNotEmpty() && !it.equals(code, ignoreCase = true) }
    }

    View(FlagView::class) {
      Prop("code") { view: FlagView, code: String? ->
        view.code = code
      }

      Prop("contentFit") { view: FlagView, contentFit: FlagContentFit? ->
        view.contentFit = contentFit ?: FlagContentFit.COVER
      }
    }
  }
}
