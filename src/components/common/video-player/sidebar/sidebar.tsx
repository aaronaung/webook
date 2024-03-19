import { fromMilliToReadableTimestamp } from "@/src/libs/time";
import { XMarkIcon } from "@heroicons/react/20/solid";

export function SideBar({ controls, state, sections }: any) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {state.sideBarShown ? (
        <XMarkIcon
          className="absolute right-10 top-4 z-50 flex w-12 cursor-pointer items-center text-gray-100"
          onClick={() => controls.toggleSideBar()}
        />
      ) : (
        <></>
      )}

      <div
        className={`absolute right-0 top-0  z-40 h-[calc(100%-theme(space.14))] w-72 origin-right bg-gradient-to-r from-[rgba(0,0,0,0.8)] to-black p-10 pl-20 text-white  duration-300 ease-in-out ${
          state.sideBarShown ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <div
        className={`absolute right-0 top-0 z-40 h-[calc(100%-theme(space.14))] w-72 origin-right pt-20 transition duration-300 ease-in-out ${
          state.sideBarShown ? "scale-x-100" : "scale-x-0"
        }`}
      >
        <div className={"scrollbar h-full w-full px-6 text-white"}>
          {sections.map((section: any, index: number) => {
            return (
              <div className="mb-8" key={`${section.label}-${index}`}>
                <div
                  onClick={() => {
                    if (section.subSections.length < 1) {
                      return;
                    }
                    controls.seek(section.subSections[0].start / 1000);
                  }}
                  className="cursor-pointer text-xl font-bold"
                >
                  {section.label.toUpperCase()}
                </div>
                <div>
                  {section.subSections.map((subSection: any) => {
                    return (
                      <div
                        onClick={() => controls.seek(subSection.start / 1000)}
                        className="mb-1 mt-2 cursor-pointer text-gray-300 transition-colors duration-300 hover:text-white"
                        key={`${subSection.label}-${subSection.start}`}
                      >
                        {`${fromMilliToReadableTimestamp(
                          subSection.start,
                        )}-${fromMilliToReadableTimestamp(subSection.end)} | ${
                          subSection.label
                        }`}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
