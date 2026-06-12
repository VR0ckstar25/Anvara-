require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'AnvaraOcr'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = 'Anvara'
  s.homepage       = 'https://anvara.app'
  s.platforms      = { :ios => '13.4' }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://example.invalid/anvara-ocr.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = "**/*.{h,m,swift}"
end
