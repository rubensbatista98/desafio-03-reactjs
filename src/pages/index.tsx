import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';
import commomStyles from '../styles/commom.module.scss';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleClick = async () => {
    const response = await fetch(nextPage);
    const data: PostPagination = await response.json();

    setPosts(old => [...old, ...data.results]);
    setNextPage(data.next_page);
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <section className={commomStyles.container}>
        <div className={styles.logo}>
          <Image src="/assets/logo.svg" width={220} height={25} alt="logo" />
        </div>

        <main>
          {posts.map(post => (
            <article key={post.uid} className={styles.post}>
              <h3 className={styles.title}>
                <Link href={`/post/${post.uid}`}>
                  <a>{post.data.title}</a>
                </Link>
              </h3>

              <p>{post.data.subtitle}</p>

              <div className={commomStyles.info}>
                <time>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>

                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </article>
          ))}

          {!!nextPage && (
            <button
              type="button"
              className={styles.button}
              onClick={handleClick}
            >
              Carregar mais posts
            </button>
          )}
        </main>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    Prismic.Predicates.at('document.type', 'pos'),
    {
      fetch: ['pos.title', 'pos.subtitle', 'pos.author', 'pos.content'],
      pageSize: 1,
    }
  );

  return {
    props: {
      postsPagination: response,
    },
  };
};
