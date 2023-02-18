import React from 'react';
import { Disclosure } from '@headlessui/react'

export default function Header() {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start md:justify-between lg:text-justify-between">
                <div className="flex flex-shrink-0 items-center text-white text-base font-bold lg:text-xl">
                  登記所備付地図データ 公共座標整理状況マップ
                </div>
                <a href="https://geolonia.github.io/chiban-kokyozahyo-area/" target="_blank" rel="noreferrer" className="hidden group md:flex items-center text-base text-white font-medium hover:text-gray-300">
                  <span className='mr-2 group-hover:opacity-70'>集計方法について</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white group-hover:opacity-70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  )
}
