/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/playlists/browser/features.h"

#include "base/feature_list.h"
#include "build/build_config.h"
#include "ui/base/ui_base_features.h"

namespace brave_playlists {
namespace features {

const base::Feature kBravePlaylists{"BravePlaylistsName",
                                    base::FEATURE_DISABLED_BY_DEFAULT};

}  // namespace features
}  // namespace brave_playlists
