import { React, useEffect, useRef, useState} from 'react';
import { useQueryClient , useInfiniteQuery } from 'react-query';
import InfiniteScroll from 'react-infinite-scroll-component';

const fetchItems = async ( key ) => {
  // console.log(key);
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${key.searchText}&page=${key.pageParam}&per_page=20&client_id=DI6uN2nH-s1lI6pzCVhUCBz7uoh4-438L3XJ0jh6JGw`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function List({searchText}) {
  const queryClient = useQueryClient();
  const [loadingVisible, setLoadingVisible] = useState(false);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    searchText,
    ({ pageParam = 1 }) => fetchItems({ searchText, pageParam}),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return allPages.length;
      },
    }
  );

  const allItems = data ? data.pages.flatMap((page) => page.results) : [];

  const infiniteScrollRef = useRef(null);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

   // Clear the query cache if searchText changes
   useEffect(() => {
    queryClient.removeQueries([searchText]);
    // Load the first page when the searchText changes
    fetchNextPage();
  }, [searchText, queryClient, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 1.0,
      }
    );

    if (infiniteScrollRef.current) {
      observer.observe(infiniteScrollRef.current);
    }

    return () => {
      if (infiniteScrollRef.current) {
        observer.unobserve(infiniteScrollRef.current);
      }
    };
  }, [infiniteScrollRef]);

  useEffect(() => {
    // console.log(hasNextPage);
    if (searchText === '') {
      setLoadingVisible(false);
    } else {
      setLoadingVisible(true);
    }
  }, [hasNextPage]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div>
       <InfiniteScroll
        dataLength={allItems.length}
        next={loadMore}
        hasMore={hasNextPage}
        loader={loadingVisible ? <h4>Loading...</h4> : null}
        ref={infiniteScrollRef}
      >
        {allItems.map(item => (
          <img key={item.id} src={item.urls.small_s3} />
        ))}
      </InfiniteScroll>
    </div>
  );
}

export default List;
